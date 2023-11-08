import { useRef, useEffect } from 'react'

export function createDomElHook<T extends Element = HTMLElement>(setEl: (el: T | null) => void) {
  return () => {
    const ref = useRef<T>(null)
    useEffect(() => (setEl(ref.current), () => setEl(null)), [])
    return ref
  }
}

export function createInitHook<T extends Element = HTMLElement>(onInit: (el: T) => void | (() => void)) {
  return () => {
    const ref = useRef<T>(null)
    useEffect(() => {
      if (ref.current) return onInit(ref.current)
    }, [])
    return ref
  }
}
