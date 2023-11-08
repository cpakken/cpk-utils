export function listenDocumentVisibilityChange(callback: (isVisible: boolean) => void) {
  const visibilityChange = () => {
    document.visibilityState === 'visible' ? callback(true) : callback(false)
  }

  document.addEventListener('visibilitychange', visibilityChange)
  return () => {
    document.removeEventListener('visibilitychange', visibilityChange)
  }
}

export function listenFocusChange(
  node: HTMLElement | Window | Document,
  callback: (isFocused: boolean) => void
) {
  // let state = false
  // const onFocus = () => !state && (callback(true), (state = true))
  // const onBlur = () => state && (callback(false), (state = false))

  const onFocus = () => callback(true)
  const onBlur = () => callback(false)

  node.addEventListener('focus', onFocus)
  node.addEventListener('blur', onBlur)
  return () => {
    node.removeEventListener('focus', onFocus)
    node.removeEventListener('blur', onBlur)
  }
}

export function listenActiveElementChange(callback: (activeElement: HTMLElement | null) => void) {
  const onActiveElementChange = () => callback(document.activeElement as HTMLElement | null)
  return listenFocusChange(document, onActiveElementChange)
}

export function listenHoverChange(node: HTMLElement | Document, callback: (isHover: boolean) => void) {
  const enter = () => callback(true)
  const leave = () => callback(false)

  node.addEventListener('mouseenter', enter)
  node.addEventListener('mouseleave', leave)

  return () => {
    node.removeEventListener('mouseenter', enter)
    node.removeEventListener('mouseleave', leave)
  }
}

export function listenKeyDownEvent(
  node: HTMLElement | Document | Window,
  onKeyDown: (event: KeyboardEvent) => void,
  options?: AddEventListenerOptions
) {
  ;(node as HTMLElement).addEventListener('keydown', onKeyDown, options)

  return () => {
    ;(node as HTMLElement).removeEventListener('keydown', onKeyDown, options)
  }
}

export function listenScrollEvent(
  node: HTMLElement | Document | Window,
  onScroll: (scroll: number) => void,
  deltaThreshold: number = 0
) {
  let prevScroll: number | undefined = undefined

  const onScrollEvent = () => {
    const scroll = node === window ? window.scrollY : (node as HTMLElement).scrollTop
    if (prevScroll === undefined || Math.abs(scroll - prevScroll) > deltaThreshold) {
      onScroll(scroll)
    }
    prevScroll = scroll
  }

  node.addEventListener('scroll', onScrollEvent, { passive: true })
  return () => {
    node.removeEventListener('scroll', onScrollEvent)
  }
}

export function listenEvent(
  node: HTMLElement | Document | Window,
  eventName: string,
  callback: (event: Event) => void,
  options?: AddEventListenerOptions
) {
  node.addEventListener(eventName, callback, options)
  return () => {
    node.removeEventListener(eventName, callback, options)
  }
}
