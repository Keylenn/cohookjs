import { Base } from "@cohook/core"
import type { Store } from "solid-js/store"

interface UseMapDataToObservable<T> {
  (): Store<T>
}

export interface SolidBase<T> extends Base<T> {
  useMapDataToObservable: UseMapDataToObservable<T>
}

export { PluginContext, Plugins, TransformPlugins } from "@cohook/core"
