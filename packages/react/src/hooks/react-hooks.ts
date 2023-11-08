import { RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  listenDocumentVisibilityChange,
  listenFocusChange,
  listenHoverChange,
  listenKeyDownEvent,
} from '@cpk-utils/dom'

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

export function useIsFirstRender(): boolean {
  const isFirst = useRef(true)

  if (isFirst.current) {
    isFirst.current = false

    return true
  }

  return isFirst.current
}

export function useHover<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null)
  const [hovered, setHovered] = useState(false)
  useEffect(() => listenHoverChange(ref.current!, setHovered), [])
  return [hovered, ref] as const
}

export function useSetHover(setHoverState: (hovered: boolean) => void) {
  const ref = useRef(null)
  useEffect(() => {
    return listenHoverChange(ref.current!, setHoverState)
  }, [setHoverState])
  return ref
}

export function useIsDocumentVisible() {
  const [isVisible, setIsVisible] = useState(true)
  useEffect(() => listenDocumentVisibilityChange(setIsVisible), [])
  return isVisible
}

export function useFocusChange(
  node: HTMLElement | Document | Window | RefObject<HTMLElement>,
  callback: (isFocused: boolean) => void
) {
  //If node is a ref, get the current value

  useEffect(() => {
    //@ts-ignore
    const nodeRef = node.current || node
    return listenFocusChange(nodeRef, callback)
  }, [callback])
}

export const useKeyDown = (
  key: string,
  callback: (event: KeyboardEvent) => void,
  node: HTMLElement | Window | Document = window
) => {
  useEffect(
    () => listenKeyDownEvent(node, (event) => event.key === key && callback(event)),
    [callback]
  )
}

export const useBoundingClientRect = (ref: RefObject<HTMLDivElement>, deps: any[] = []) => {
  const [rect, setRect] = useState<DOMRect | null>(null)
  useLayoutEffect(() => {
    if (ref.current) {
      setRect(ref.current.getBoundingClientRect())
    }
  }, deps)

  return rect
}

/** On mount, change prop from A to B after 1ms (used for css transitions)
 * @param enable - mount transition if true, otherwise return to <B>
 */
export function useTransitionOnMount<A, B>(from: A, to: B, enable: boolean = true) {
  const [value, setValue] = useState<A | B>(from)
  const isFirstRender = useIsFirstRender()

  if (isFirstRender && enable) {
    setTimeout(() => setValue(to), 1)
  }

  return enable ? value : to
}
