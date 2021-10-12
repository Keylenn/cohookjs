import { default as createBaseContainer } from "@cohook/core"
import createSolidBaseContainer from "./createContainer"
import { SolidWithPlugins, Plugins, TransformPlugins } from "../types"
import cloneDeep from "lodash-es/cloneDeep"

export default function createContainerWithPlugins<T, P extends Plugins<T>>(
  initialData: T,
  plugins: P
): SolidWithPlugins<T> & {
  plugins: TransformPlugins<P>
}
export default function createContainerWithPlugins(
  initialData: any,
  plugins: any
) {
  const { commit: baseCommit, ...base } = createBaseContainer(
    initialData,
    plugins
  )
  const shadowData = cloneDeep(base.getData())
  const { commit: solidCommit, ...solidBase } =
    createSolidBaseContainer(shadowData)

  const commit = (updater: any) => {
    solidCommit(updater)
    return baseCommit(updater)
  }

  return {
    ...base,
    commit,
    ...solidBase,
  }
}
