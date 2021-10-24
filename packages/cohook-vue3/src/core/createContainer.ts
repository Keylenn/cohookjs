import { default as createBaseContainer } from "@cohook/core"
import useMapDataToAccessorPlugin from "./useMapDataToAccessorPlugin"
import { Vue3Base, TransformPlugins, PluginOption, ShareOption } from "../types"

export default function createContainer<T>(initialData: T): Vue3Base<T>
export default function createContainer<T, U extends ShareOption<T>>(
  initialData: T,
  option: U
): Vue3Base<T>
export default function createContainer<
  T,
  O extends ShareOption<T> & PluginOption<T>
>(
  initialData: T,
  option: O
): Vue3Base<T> & {
  plugins: TransformPlugins<O["plugins"]>
}
export default function createContainer(initialData: any, option?: any) {
  const vue3Container: any = createBaseContainer(initialData, {
    ...option,
    plugins: {
      useMapDataToAccessorPlugin,
      ...option?.plugins,
    },
  })

  const { plugins, ...base } = vue3Container

  const { useMapDataToAccessorPlugin: useMapDataToAccessor, ...restPlugins } =
    plugins

  const vue3Base = {
    ...base,
    useMapDataToAccessor,
  }

  const hasPlugins = restPlugins && Object.keys(restPlugins).length

  return hasPlugins
    ? {
        ...vue3Base,
        plugins: restPlugins,
      }
    : vue3Base
}
