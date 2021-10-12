import { Updater } from "@cohook/core"
import type { Store } from "solid-js/store"
export interface SolidBase<T> {
  useMapDataToAccessor: () => () => Store<T>
  commit: (updater: Updater<T>) => T
}
export interface SolidWithPlugins<T> extends SolidBase<T> {
  getData: () => T
}

export { PluginContext, Plugins, TransformPlugins } from "@cohook/core"
