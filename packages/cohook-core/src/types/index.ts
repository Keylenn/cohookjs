import { Draft } from "immer"
import Container from "../core/Container"

export type DraftDataRef<T = any> = Draft<{ current: T }>

export type Updater<T = any> = (draftDataRef: DraftDataRef<T>) => void

export type AnyFn = (...args: any) => any

export type AnyObj = Record<string, any>

export interface PropEffect {
  trackId: number
  pathId?: number // track Proxy data like: data.xxxx ✔
  hasSubProp: boolean
  triggerHook: AnyFn
}

export type TargetMap = Map<PropertyKey, Set<PropEffect>>

interface PathIdItem {
  updateUpperPropEffectHasSubPropHook: () => void
}
export interface TrackIdItem {
  isDataRefCurrPropEffHasSubPropChanged: boolean
  pathIdMap: Map<number, Set<PathIdItem>>
  clearEffectSet: Set<() => void>
}

export type WrappedDataRef<T> = { current: T }

export interface Base<T> {
  getData: () => T
  commit: (updater: Updater<T>) => T
}

export type PluginContext<T = any> = Base<T> &
  Pick<Container<T>, "tryToTrackEffect" | "cleanUpEffect">

export type Plugins<T> = Record<
  string,
  (this: PluginContext<T>, ...args: any) => any
>

export type TransformPlugins<P extends Plugins<any>> = {
  [K in keyof P]: OmitThisParameter<P[K]>
}

export interface ShareOption<T> {
  shareProvider?: (container: Container<T>) => void
  shareConsumer?: () => Container<T>
}
export interface PluginOption<T> {
  plugins: Plugins<T>
}

export interface TriggerOption<T> {
  changedPatches: any[]
  prev: T
  next: T | null
}

export interface TrackOption<T> {
  effectHook: (option: TriggerOption<T>) => any
  mapFn?: (data: T) => any
}
