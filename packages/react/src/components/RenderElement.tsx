import { ComponentPropsWithoutRef, CSSProperties, forwardRef, useLayoutEffect, useRef } from 'react'
import mergeRefs from 'react-merge-refs'

type RenderElementProps = {
  el: HTMLElement
  innerStyle?: CSSProperties
} & ComponentPropsWithoutRef<'div'>

export const RenderElement = forwardRef(({ el, innerStyle, ...rest }: RenderElementProps, _ref) => {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    ref.current!.append(el)
  }, [])

  useLayoutEffect(() => {
    if (innerStyle) Object.assign(el.style, innerStyle)
  }, [innerStyle])

  return <div ref={mergeRefs([ref, _ref])} {...rest}></div>
})
