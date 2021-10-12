import React from "react"
import useIsomorphicLayoutEffect from "./useIsomorphicLayoutEffect"
import { MapStateFn, PluginContext } from "../../types"

export default function useMapDataToStatePlugin<T = any>(
  this: PluginContext<T>,
  mapStateFn?: MapStateFn<T>
) {
  const [, forceRender] = React.useReducer((s) => s + 1, 0)

  useIsomorphicLayoutEffect(() => {
    const res = this.tryToTrackEffect({
      mapFn: mapStateFn,
      effectHook: forceRender,
    })

    return () => {
      typeof res?.trackId === "number" && this.cleanUpEffect(res.trackId)
    }
  }, [])

  const data = this.getData()
  return typeof mapStateFn === "function" ? mapStateFn(data) : data
}
