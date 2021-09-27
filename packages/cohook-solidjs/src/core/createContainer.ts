import { default as createBaseContainer, AnyFn } from "@cohook/core"
import { SolidBase, Plugins, TransformPlugins } from "../types"
import { createStore, produce } from "solid-js/store"
import cloneDeep from "lodash-es/cloneDeep"

export default function createContainer<T>(initialData: T): SolidBase<T>
export default function createContainer<T, P extends Plugins<T>>(
  initialData: T,
  plugins: P
): SolidBase<T> & {
  plugins: TransformPlugins<P>
}
export default function createContainer<T>(initialData: T, plugins?: any) {
  const { plugins: basePlugins, ...base } = createBaseContainer(
    initialData,
    plugins
  )
  const dataCopy: any = cloneDeep({ current: base.getData() })
  const [observableData, setObservableData] = createStore(dataCopy) as any

  const commit = (updater: AnyFn) => {
    const a = produce(updater)
    typeof a === "function" && setObservableData(a as AnyFn)
    return base.commit(updater)
  }

  const useMapDataToObservable = () => observableData.current

  const solidBase = {
    ...base,
    commit,
    useMapDataToObservable,
  }

  const hasPlugins = basePlugins && Object.keys(basePlugins).length

  return hasPlugins
    ? {
        ...solidBase,
        plugins: basePlugins,
      }
    : solidBase
}
