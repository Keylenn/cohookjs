import { default as createBaseContainer } from "@cohook/core"
import useMapDataToAccessorPlugin from "./useMapDataToAccessorPlugin"
import { Vue3Base, Plugins, TransformPlugins } from "../types"

export default function createContainer<T>(initialData: T): Vue3Base<T>
export default function createContainer<T, P extends Plugins<T>>(
  initialData: T,
  plugins: P
): Vue3Base<T> & {
  plugins: TransformPlugins<P>
}
export default function createContainer(initialData: any, otherPlugins?: any) {
  const { plugins, ...base } = createBaseContainer(initialData, {
    useMapDataToAccessorPlugin,
    ...otherPlugins,
  })

  const { useMapDataToAccessorPlugin: useMapDataToAccessor, ...restPlugins } =
    plugins

  const Vue3Base = {
    ...base,
    useMapDataToAccessor,
  }

  const hasPlugins = restPlugins && Object.keys(restPlugins).length

  return hasPlugins
    ? {
        ...Vue3Base,
        plugins: restPlugins,
      }
    : Vue3Base
}
