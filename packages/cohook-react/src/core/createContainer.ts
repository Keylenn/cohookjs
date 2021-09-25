import { default as createBaseContainer } from "@cohook/core"
import useMapDataToStatePlugin from "./hooks/useMapDataToStatePlugin"
import { ReactBase, Plugins, TransformPlugins } from "../types"

export default function createContainer<T>(initialData: T): ReactBase<T>
export default function createContainer<T, P extends Plugins<T>>(
  initialData: T,
  plugins: P
): ReactBase<T> & {
  plugins: TransformPlugins<P>
}
export default function createContainer(initialData: any, otherPlugins?: any) {
  const { plugins, ...base } = createBaseContainer(initialData, {
    useMapDataToStatePlugin,
    ...otherPlugins,
  })

  const { useMapDataToStatePlugin: useMapDataToState, ...restPlugins } = plugins

  const reactBase = {
    ...base,
    useMapDataToState,
  }

  const hasPlugins = restPlugins && Object.keys(restPlugins).length

  return hasPlugins
    ? {
        ...reactBase,
        plugins: restPlugins,
      }
    : reactBase
}
