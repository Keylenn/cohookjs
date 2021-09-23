import { Patch } from "immer"
import createTrackableData from "../utils/createTrackableData"
import {
  AnyFn,
  AnyObj,
  PropEffect,
  TargetMap,
  WrappedDataRef,
  TrackIdItem,
  TriggerOption,
  TrackOption,
} from "../types"

let trackId = 0
let pathId = 0

const CONTAINER_EFFECT_MAP = Symbol.for("CONTAINER_EFFECT_MAP")
const TRACK_ID_MAP = Symbol.for("TRACK_ID_MAP")
const PENDING_TRIGGER_EFFECT_SET = Symbol.for("PENDING_TRIGGER_EFFECT_SET")
const TRIGGER_OPTION = Symbol.for("TRIGGER_OPTION")

const WRAPPED_DATA_REF_EFFECT_KEY = "current"

// 类型问题
class Container<T> {
  wrappedDataRef: WrappedDataRef<T>;
  [CONTAINER_EFFECT_MAP]: Map<AnyObj, TargetMap>;
  [TRACK_ID_MAP]: Map<number, TrackIdItem>;
  [TRIGGER_OPTION]: TriggerOption<T>;
  [PENDING_TRIGGER_EFFECT_SET]: Set<AnyFn>

  constructor(data: T) {
    this[CONTAINER_EFFECT_MAP] = new Map()
    this[TRACK_ID_MAP] = new Map()
    this[PENDING_TRIGGER_EFFECT_SET] = new Set()
    this[TRIGGER_OPTION] = {
      changedPatches: [],
      prev: data,
      next: null,
    }
    this.wrappedDataRef = { current: data }
  }

  getTargetByPath = (
    target: WrappedDataRef<T>,
    path: (string | number)[],
    defaultTarget: WrappedDataRef<T>
  ) => {
    return (
      path?.reduce((acc: any, prop) => acc?.[prop], target) ?? defaultTarget
    )
  }

  getTargetEffectMap(target: AnyObj) {
    const conEffWeakMap = this[CONTAINER_EFFECT_MAP]
    return conEffWeakMap.get(target)
  }

  updateTargetEffectMap({
    prevTarget,
    nextTarget,
    nextTargetMap,
  }: {
    prevTarget: AnyObj
    nextTarget: AnyObj
    nextTargetMap: TargetMap
  }) {
    const conEffWeakMap = this[CONTAINER_EFFECT_MAP]
    if (conEffWeakMap.delete(prevTarget)) {
      conEffWeakMap.set(nextTarget, nextTargetMap)
      return true
    }
    return false
  }

  tryToUpdateUpperPropEffectHasSubProp(target: any) {
    // 判断targetProp是否改变: data.a.a1 ---> data.b
    const isTargetPropFinishTracking = target === this.wrappedDataRef.current
    const trackIdItem = this[TRACK_ID_MAP].get(trackId) as TrackIdItem
    if (isTargetPropFinishTracking) {
      if (!trackIdItem?.isDataRefCurrPropEffHasSubPropChanged) {
        this[TRACK_ID_MAP].set(trackId, {
          ...trackIdItem,
          isDataRefCurrPropEffHasSubPropChanged: true,
        })
        const wrappedDataRefEffectMap = this.getTargetEffectMap(
          this.wrappedDataRef
        )
        const currentPropEffSet = wrappedDataRefEffectMap?.get(
          WRAPPED_DATA_REF_EFFECT_KEY
        )
        currentPropEffSet?.forEach((eff) => {
          if (eff.trackId === trackId) eff.hasSubProp = true
        })
      }

      pathId += 1
    } else {
      trackIdItem?.pathIdMap.get(pathId)?.forEach((pathIdItem) => {
        pathIdItem?.updateUpperPropEffectHasSubPropHook()
      })
    }
  }

  setEffect({
    target,
    prop,
    effect,
  }: {
    target: AnyObj
    prop: PropertyKey
    effect: PropEffect
  }) {
    // addTargetEffect
    let targetEffectMap = this.getTargetEffectMap(target)
    if (targetEffectMap === undefined) {
      this[CONTAINER_EFFECT_MAP].set(target, (targetEffectMap = new Map()))
    }
    let propEffSet = targetEffectMap.get(prop)
    if (propEffSet === undefined) {
      targetEffectMap.set(prop, (propEffSet = new Set()))
    }
    propEffSet.add(effect)

    // addTrackIdItem
    let trackIdItem = this[TRACK_ID_MAP].get(trackId)
    if (trackIdItem === undefined) {
      this[TRACK_ID_MAP].set(
        trackId,
        (trackIdItem = {
          isDataRefCurrPropEffHasSubPropChanged: false,
          pathIdMap: new Map(),
          clearEffectSet: new Set(),
        })
      )
    }
    trackIdItem.clearEffectSet.add(() => propEffSet?.delete(effect))

    const { pathIdMap } = trackIdItem
    let pathIdItemSet = pathIdMap.get(pathId)
    if (pathIdItemSet === undefined) {
      pathIdMap.set(pathId, (pathIdItemSet = new Set()))
    }

    pathIdItemSet.add({
      updateUpperPropEffectHasSubPropHook: () => (effect.hasSubProp = true),
    })
  }

  tryToTrackEffect({ mapFn, effectHook }: TrackOption<T>) {
    try {
      // track
      const option = {
        proxies: [] as any[],
        getHook: ({ target, prop }: any) => {
          this.tryToUpdateUpperPropEffectHasSubProp(target)

          // set Effect
          const effect: PropEffect = {
            trackId,
            hasSubProp: false,
            triggerHook: effectHook,
          }

          if (target !== this.wrappedDataRef) effect.pathId = pathId

          this.setEffect({
            target,
            prop,
            effect,
          })
        },
      }

      const { current: trackedData } = createTrackableData(
        this.wrappedDataRef,
        option
      )
      mapFn?.(trackedData)

      // end
      const currentTrackId = trackId
      trackId += 1
      option.proxies?.forEach((revocableProxy) => revocableProxy?.revoke())

      return { trackId: currentTrackId }
    } catch (error) {
      console.error("Error: ", error)
      return null
    }
  }

  cleanUpEffect(pendingClearTrackId: number) {
    const trackIdItem = this[TRACK_ID_MAP].get(pendingClearTrackId)
    trackIdItem?.clearEffectSet?.forEach((eff) => eff?.())
    this[TRACK_ID_MAP].delete(pendingClearTrackId)
  }

  batchTriggerPendingEffects() {
    const trEffSet = this[PENDING_TRIGGER_EFFECT_SET]
    trEffSet.forEach((effectHandler) => effectHandler?.(this[TRIGGER_OPTION]))
    trEffSet.clear()
  }

  addPendingEffectsByPatches(
    changedPatches: Patch[],
    nextWrappedDataRef: WrappedDataRef<T>
  ) {
    this[TRIGGER_OPTION] = {
      changedPatches,
      prev: this.wrappedDataRef.current,
      next: nextWrappedDataRef.current,
    }
    const handler = ({ path: changedPropPath }: Patch) => {
      const _changedPropPath = changedPropPath.slice()

      let { length } = _changedPropPath
      const { wrappedDataRef } = this
      while (length) {
        const isTargetProp = length === changedPropPath.length // 直接引发数据变更的prop
        const prop = _changedPropPath.pop()
        const target = this.getTargetByPath(
          wrappedDataRef,
          _changedPropPath,
          wrappedDataRef
        )
        const targetEffectMap = this.getTargetEffectMap(target)
        const propEffSet = prop !== undefined && targetEffectMap?.get(`${prop}`)

        // Update TargetEffectMap in real time
        if (targetEffectMap) {
          const nextTarget = this.getTargetByPath(
            nextWrappedDataRef,
            _changedPropPath,
            nextWrappedDataRef
          )
          const effectHandler = () => {
            this.updateTargetEffectMap({
              prevTarget: target,
              nextTarget,
              nextTargetMap: targetEffectMap,
            })
          }
          this[PENDING_TRIGGER_EFFECT_SET].add(effectHandler)
        }

        length -= 1
        if (!propEffSet) continue

        if (isTargetProp) {
          // 引发数据变化的目标属性，需要执行订阅了目标属性及其子属性的effect
          propEffSet.forEach(
            (eff) =>
              eff?.triggerHook &&
              this[PENDING_TRIGGER_EFFECT_SET].add(eff.triggerHook)
          )
        } else {
          // 查找目标属性的祖先元素，只需执行订阅了属性本身的effect
          propEffSet.forEach((eff) => {
            if (eff?.hasSubProp === false && eff?.triggerHook)
              this[PENDING_TRIGGER_EFFECT_SET].add(eff.triggerHook)
          })
        }
      }
    }

    changedPatches.forEach(handler)
  }
}

export default Container
