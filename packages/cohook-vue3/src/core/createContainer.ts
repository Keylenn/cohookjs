import { default as createBaseContainer } from "@cohook/core"
import useMapDataToAccessorPlugin from "./useMapDataToAccessorPlugin"
import { ReactBase, Plugins } from "../types"

export default function createContainer<T>(initialData: T): ReactBase<T>
export default function createContainer<T, P extends Plugins<T>>(
  initialData: T,
  plugins: P
): ReactBase<T> & {
  plugins: P
}
export default function createContainer(initialData: any, otherPlugins?: any) {
  const { plugins, ...base } = createBaseContainer(initialData, {
    useMapDataToAccessorPlugin,
    ...otherPlugins,
  })

  const { useMapDataToAccessorPlugin: useMapDataToAccessor, ...restPlugins } =
    plugins

  const reactBase = {
    ...base,
    useMapDataToAccessor,
  }

  const hasPlugins = restPlugins && Object.keys(restPlugins).length

  return hasPlugins
    ? {
        ...reactBase,
        plugins: restPlugins,
      }
    : reactBase
}
