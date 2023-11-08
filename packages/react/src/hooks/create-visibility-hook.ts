import { RefObject, useLayoutEffect, useState } from 'react'
import { debounce } from '@cpk-utils/factories'

export type VisiblityChangeHandler = (isVisible: boolean) => void

type VisibleHookOptions = IntersectionObserverInit & {
  debounceReset?: number
}

/**
 * Creates a react hook that can be used to determine if the element it is applied to is visible in the viewport
 * @param options - Options for the IntersectionObserver
 * @param wrapperFn - Function that wraps the IntersectionObserver callback
 *
 * @example
 * const useIsVisible = createIsVisibleHook({
 *   threshold: 0,
 *   rootMargin: '150px 0px',
 * })
 *
 */
export function createHandleVisibilityHook(
  { debounceReset = 400, ...options }: VisibleHookOptions,
  wrapperFn?: <FN extends Function>(fn: FN) => FN
) {
  const elementVisibilityCache = new WeakMap<Element, VisiblityChangeHandler>()

  //Creates intersection observer to determine if an element is visible in the viewport
  const callback: IntersectionObserverCallback = (entries) => {
    entries.forEach((entry) => {
      const handler = elementVisibilityCache.get(entry.target)
      handler?.(entry.isIntersecting)
    })
  }

  const io = new IntersectionObserver(wrapperFn ? wrapperFn(callback) : callback, options)

  return <T extends Element>(
    ref: RefObject<T>,
    onVisiblityChange: VisiblityChangeHandler,
    _debounceReset?: number
  ) => {
    // const ref = useRef<T>(null)

    useLayoutEffect(() => {
      const element = ref.current
      if (!element) return

      const debounceSet = debounce(onVisiblityChange, _debounceReset ?? debounceReset)
      const setter = (isVisible: boolean) =>
        isVisible ? debounceSet.now(true) : debounceSet(false)
      elementVisibilityCache.set(element, setter)

      // elementVisibilityCache.set(element, onVisiblityChange)
      io.observe(element)

      return () => {
        io.unobserve(element)
        debounceSet.cancel()
      }
    }, [])
  }
}

//Uses single IntersectionObserver instance to track all elements used by created hook
export function createIsVisibleHook(options: VisibleHookOptions) {
  const isVisibleHook = createHandleVisibilityHook(options)

  return <T extends Element>(ref: RefObject<T>, debounceReset?: number) => {
    const [isVisible, setIsVisible] = useState(false)
    isVisibleHook(ref, setIsVisible, debounceReset)
    return isVisible
  }
}
