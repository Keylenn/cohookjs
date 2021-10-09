import { Base } from "@cohook/core"

interface UseMapDataToAccessorPlugin<T> {
  (): () => T
}

interface UseMapDataToAccessorPlugin<T> {
  <M extends MapStateFn<T>>(mapStateFn: M): () => ReturnType<M>
}

export type MapStateFn<D> = (data: D) => any

export interface Vue3Base<T> extends Base<T> {
  useMapDataToAccessor: UseMapDataToAccessorPlugin<T>
}

export { PluginContext, Plugins, TransformPlugins } from "@cohook/core"
