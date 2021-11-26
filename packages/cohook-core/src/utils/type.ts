const is = (target: any, type: string) =>
  Object.prototype.toString.call(target).slice(8, -1) === type

export const isObject = (target: any) => is(target, "Object")
export const isArray = (target: any) => is(target, "Array")
export const isMap = (target: any) => is(target, "Map")
export const isSet = (target: any) => is(target, "Set")
