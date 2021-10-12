import { default as createBaseContainer } from "@cohook/core"
import useMapDataToStatePlugin from "./hooks/useMapDataToStatePlugin"
import { PReactBase, Plugins, TransformPlugins } from "../types"

export default function createContainer<T>(initialData: T): PReactBase<T>
export default function createContainer<T, P extends Plugins<T>>(
  initialData: T,
  plugins: P
): PReactBase<T> & {
  plugins: TransformPlugins<P>
}
export default function createContainer(initialData: any, otherPlugins?: any) {
  const { plugins, ...base } = createBaseContainer(initialData, {
    useMapDataToStatePlugin,
    ...otherPlugins,
  })

  const { useMapDataToStatePlugin: useMapDataToState, ...restPlugins } = plugins

  const preactBase = {
    ...base,
    useMapDataToState,
  }

  const hasPlugins = restPlugins && Object.keys(restPlugins).length

  return hasPlugins
    ? {
        ...preactBase,
        plugins: restPlugins,
      }
    : preactBase
}
