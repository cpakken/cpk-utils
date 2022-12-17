import { createElement, CSSProperties, forwardRef, ReactNode, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import mergeRefs from 'react-merge-refs'

interface ShadowPortalProps {
  children: ReactNode
  id?: string
  tag?: string
  mode?: ShadowRootMode
  style?: CSSProperties
  className?: string
}

export const Shadow = forwardRef((props: ShadowPortalProps, _ref) => {
  const { mode = 'closed', tag = 'div', children, ...rest } = props

  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null)
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (ref.current) {
      const shadowRoot = ref.current.attachShadow({ mode })
      setShadowRoot(shadowRoot)
    }
  }, [])

  return createElement(
    tag,
    {
      ...rest,
      ref: mergeRefs([ref, _ref]),
    },
    shadowRoot && createPortal(children, shadowRoot)
  )
})
