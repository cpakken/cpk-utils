import { useIsoLayoutEffect } from './use-iso-layout-effect'
import { disableAnimation } from '../dom'
import { useIsFirstRender } from './use-is-first-render'

type UpdateClassNameOptions = {
  /** @default false */
  transitionOnMount?: boolean

  disableTransitionOnChange?: boolean

  element?: HTMLElement | undefined
}

/**Used to update HTMLElement class outside the dom tree (document.documentElement, document.body) */
export function useUpdateClassName(className: string | undefined, options: UpdateClassNameOptions = {}) {
  const { disableTransitionOnChange, transitionOnMount, element = defaultElement } = options
  const isFirstRender = useIsFirstRender()

  useIsoLayoutEffect(() => {
    if (className) {
      const enable = (isFirstRender && !transitionOnMount) || disableTransitionOnChange ? disableAnimation() : null

      element.classList.add(className)

      //Cleanup disableAnimation
      enable?.()
    } else {
      console.warn('No className provided to useUpdateClassName')
    }

    return () => {
      className && element.classList.remove(className)
    }
  }, [className, element])
}

// Mock element if SSR else real body element.
const noop = () => {}
const mockElement = { classList: { add: noop, remove: noop } } as HTMLElement
const defaultElement = globalThis?.document?.documentElement || mockElement
