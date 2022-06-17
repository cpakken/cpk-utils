import { useEffect } from 'react'

export function useIntersectionObserver(
  ref: React.RefObject<HTMLElement>,
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) {
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      callback(entry)
    }, options)

    observer.observe(ref.current!)

    return () => observer.disconnect()
  }, [])
}
