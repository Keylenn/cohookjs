import { SolidBase } from "../types"
import { createStore, produce } from "solid-js/store"

export default function createContainer<T>(initialData: T): SolidBase<T>
export default function createContainer(initialData: any) {
  const [observableData, setObservableData] = createStore({
    current: initialData,
  }) as any

  const commit = (updater: any) => {
    setObservableData(produce(updater))
    return observableData.current
  }

  return {
    commit,
    useMapDataToAccessor: () => () => observableData.current,
  }
}
