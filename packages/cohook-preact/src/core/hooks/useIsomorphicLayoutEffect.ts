import { useEffect, useLayoutEffect } from "preact/hooks"

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" &&
  typeof window.document !== "undefined" &&
  typeof window.document.createElement !== "undefined"
    ? useLayoutEffect
    : useEffect

export default useIsomorphicLayoutEffect
