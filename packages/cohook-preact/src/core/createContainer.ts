import { default as createBaseContainer } from "@cohook/core"
import useMapDataToStatePlugin from "./hooks/useMapDataToStatePlugin"
import {
  PReactBase,
  PluginOption,
  TransformPlugins,
  ShareOption,
} from "../types"

export default function createContainer<T>(initialData: T): PReactBase<T>
export default function createContainer<T, U extends ShareOption<T>>(
  initialData: T,
  option: U
): PReactBase<T>
export default function createContainer<
  T,
  O extends ShareOption<T> & PluginOption<T>
>(
  initialData: T,
  option: O
): PReactBase<T> & {
  plugins: TransformPlugins<O["plugins"]>
}
export default function createContainer(initialData: any, option?: any) {
  const preactContainer: any = createBaseContainer(initialData, {
    ...option,
    plugins: {
      useMapDataToStatePlugin,
      ...option?.plugins,
    },
  })

  const { plugins, ...base } = preactContainer

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
