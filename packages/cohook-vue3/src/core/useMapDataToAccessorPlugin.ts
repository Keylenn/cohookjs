import { onMounted, onUnmounted, getCurrentInstance } from "vue"
import { PluginContext, MapStateFn } from "../types"

export default function useMapDataToAccessorPlugin<T = any>(
  this: PluginContext<T>,
  mapStateFn?: MapStateFn<T>
) {
  let trackId: number | void

  onMounted(() => {
    const instance = getCurrentInstance()
    const res = this.tryToTrackEffect({
      mapFn: mapStateFn,
      effectHook: () => {
        instance?.proxy?.$forceUpdate()
      },
    })
    trackId = res?.trackId
  })

  onUnmounted(() => {
    typeof trackId === "number" && this.cleanUpEffect(trackId)
  })

  return () => {
    const data = this.getData()
    return typeof mapStateFn === "function" ? mapStateFn(data) : data
  }
}
