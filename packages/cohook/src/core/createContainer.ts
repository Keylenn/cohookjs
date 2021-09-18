import Container from "./Container"
import { Base, AnyObj, Plugins } from "../types"
import { produceWithPatches, enablePatches, setAutoFreeze } from "immer"

enablePatches()

setAutoFreeze(false)

export default function createContainer<T>(initialData: T): Base<T>
export default function createContainer<T, P extends Plugins<T>>(
  initialData: T,
  plugins: P
): Base<T> & {
  plugins: P
}
export default function createContainer(initialData: any, plugins?: any) {
  const container = new Container(initialData)

  const base = {
    getData: () => container.wrappedDataRef.current,
    commit: (updater: any) => {
      try {
        const [nextWrappedDataRef, changedPatches] = produceWithPatches(
          container.wrappedDataRef,
          updater
        )

        container.addPendingEffectsByPatches(changedPatches, nextWrappedDataRef)
        container.wrappedDataRef = nextWrappedDataRef
        container.batchTriggerPendingEffects()

        return nextWrappedDataRef.current
      } catch (error) {
        console.error(`Error: `, error)
        return container.wrappedDataRef
      }
    },
  }
  const hasPlugins = plugins && Object.keys(plugins).length
  if (!hasPlugins) return base

  const bindPlugins: AnyObj = {}
  const context = {
    ...base,
    tryToTrackEffect: container.tryToTrackEffect,
    cleanUpEffect: container.cleanUpEffect,
  }

  try {
    for (const name in plugins) {
      bindPlugins[name] = plugins[name].bind(context)
    }
    return {
      ...base,
      plugins: bindPlugins,
    }
  } catch (error) {
    console.log(error)
    return base
  }
}
