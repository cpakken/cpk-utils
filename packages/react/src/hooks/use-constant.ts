import { useRef } from 'react'

export const useConst = <T>(fn: T | (() => T)): T => {
  const ref = useRef<T | undefined>()

  if (ref.current === undefined) {
    ref.current = typeof fn === 'function' ? (fn as any)() : fn
  }

  return ref.current as T
}
