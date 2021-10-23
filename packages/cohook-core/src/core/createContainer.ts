import Container from "./Container"
import {
  Base,
  AnyObj,
  ShareOption,
  PluginOption,
  TransformPlugins,
} from "../types"
import { produceWithPatches, enablePatches, setAutoFreeze } from "immer"

enablePatches()

setAutoFreeze(false)

export default function createContainer<T>(initialData: T): Base<T>
export default function createContainer<T, U extends ShareOption<T>>(
  initialData: T,
  option: U
): Base<T>
export default function createContainer<
  T,
  O extends ShareOption<T> & PluginOption<T>
>(
  initialData: T,
  option: O
): Base<T> & {
  plugins: TransformPlugins<O["plugins"]>
}
export default function createContainer(
  initialData: any,
  { plugins, shareProvider, shareConsumer }: any = {}
) {
  let container = null as unknown as Container<any>

  const sharedContainer = shareConsumer?.()
  // check sharedContainer valid
  if (sharedContainer?.wrappedDataRef && sharedContainer?.tryToTrackEffect) {
    container = sharedContainer
  }

  if (container === null) container = new Container(initialData)

  shareProvider?.(container)

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
    tryToTrackEffect: container.tryToTrackEffect.bind(container),
    cleanUpEffect: container.cleanUpEffect.bind(container),
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
