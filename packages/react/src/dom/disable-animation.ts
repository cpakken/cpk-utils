//https://github.com/pacocoursey/next-themes/blob/master/index.tsx

export function createDisableAnimation() {
  if (!globalThis.document) return () => () => {}

  const css = document?.createElement('style')
  css.sheet?.insertRule
  css.appendChild(
    document.createTextNode(
      `*{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`
    )
  )

  //If disableAnimation is called multiple times, we only need to add the style once
  //keep track of the number of times disableAnimation has been
  let count = 0
  const styleContainer = document.head

  const disableAnimation = () => {
    if (count++ === 0) {
      styleContainer.appendChild(css)
    }

    return () =>
      setTimeout(() => {
        if (--count === 0) {
          // Force restyle (reflow)
          ;(() => window.getComputedStyle(document.body))()

          // Wait for next tick before removing
          setTimeout(() => styleContainer.removeChild(css), 0)
          // setTimeout(() => styleContainer.removeChild(css), 1)
        }
      }, 0)
  }

  return disableAnimation
}

export const disableAnimation = createDisableAnimation()

// export const disableAnimation = () => {
//   const css = document.createElement('style')
//   css.sheet?.insertRule
//   css.appendChild(
//     document.createTextNode(
//       `*{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`
//     )
//   )
//   document.head.appendChild(css)

//   return () => {
//     // Force restyle (reflow)
//     ;(() => window.getComputedStyle(document.body))()

//     // Wait for next tick before removing
//     setTimeout(() => {
//       document.head.removeChild(css)
//     }, 0)
//     // }, 1) //maybe 1 ms?
//   }
// }
