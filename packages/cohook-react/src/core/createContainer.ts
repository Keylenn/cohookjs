import { default as createBaseContainer } from "@cohook/core"
import useMapDataToStatePlugin from "./hooks/useMapDataToStatePlugin"
import {
  ReactBase,
  TransformPlugins,
  ShareOption,
  PluginOption,
} from "../types"

export default function createContainer<T>(initialData: T): ReactBase<T>
export default function createContainer<T, U extends ShareOption<T>>(
  initialData: T,
  option: U
): ReactBase<T>
export default function createContainer<
  T,
  O extends ShareOption<T> & PluginOption<T>
>(
  initialData: T,
  option: O
): ReactBase<T> & {
  plugins: TransformPlugins<O["plugins"]>
}
export default function createContainer(initialData: any, option?: any) {
  const reactContainer: any = createBaseContainer(initialData, {
    ...option,
    plugins: {
      useMapDataToStatePlugin,
      ...option?.plugins,
    },
  })

  const { plugins, ...base } = reactContainer

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
