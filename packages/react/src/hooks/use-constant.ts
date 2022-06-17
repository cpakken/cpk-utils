import { useRef } from 'react'

// export function useConstant<T>(fn: () => T): T {
//   const ref = useRef<T>()

//   if (ref.current === undefined) {
//     ref.current = fn()
//   }

//   return ref.current
// }

export function useConstant<T>(initialValue: T | (() => T)): T {
  const ref = useRef<T>()
  if (ref.current === undefined) {
    ref.current = initialValue instanceof Function ? initialValue() : initialValue
  }

  return ref.current
}
