import { AnyObj } from "../types"
import { isMap, isSet } from "../utils/type"
interface Option<T> {
  proxies: any[]
  getHook: ({ target, prop }: { target: T; prop: PropertyKey }) => void
}

const PROXY_2_ROW = new WeakMap()
const ALLOW_TRACKABLE_MAP_PROPS = ["get", "has"]

export default function createTrackableData<T extends AnyObj>(
  target: T,
  option: Option<T>
) {
  const { proxies, getHook } = option

  const tryToTrackReturnVal = (value: any) => {
    return typeof value === "object" && value !== null
      ? createTrackableData<typeof value>(value, option)
      : value
  }

  const handler = {
    get: (obj: AnyObj, prop: any, receiver: any) => {
      let _obj = obj

      // add MapSet prop interceptor
      if (isMap(obj) || isSet(obj)) {
        if (!ALLOW_TRACKABLE_MAP_PROPS.includes(prop) || isSet(obj)) {
          console.warn(
            `[Not recommended]: Using ${obj}.${prop} in map data function may cause unnecessary side effects`
          )
        }

        _obj = {
          [prop](...params: any[]) {
            const rawTarget = PROXY_2_ROW.get(this)
            const value = rawTarget?.[prop]?.(...params) ?? rawTarget?.[prop]
            console.log(2222, value)
            return tryToTrackReturnVal(value)
          },
        }
      }

      const value = Reflect.get(_obj, prop, receiver)

      getHook?.({
        target,
        prop,
      })

      return tryToTrackReturnVal(value)
    },
  }
  const revocable: any = Proxy.revocable<T>(target, handler)
  proxies?.push(revocable)
  PROXY_2_ROW.set(revocable.proxy, target)
  return revocable.proxy
}
