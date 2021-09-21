import { Base } from "@cohook/core"

interface UseMapDataToStatePlugin<T> {
  (): T
}

interface UseMapDataToStatePlugin<T> {
  <M extends MapStateFn<T>>(mapStateFn: M): ReturnType<M>
}

export type MapStateFn<D> = (data: D) => any

export interface ReactBase<T> extends Base<T> {
  useMapDataToState: UseMapDataToStatePlugin<T>
}

export { PluginContext, Plugins } from "@cohook/core"
