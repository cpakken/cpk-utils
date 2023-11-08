/* 
  'sm': '640px',
  // => @media (min-width: 640px) { ... }

  'md': '768px',
  // => @media (min-width: 768px) { ... }

  'lg': '1024px',
  // => @media (min-width: 1024px) { ... }

  'xl': '1280px',
  // => @media (min-width: 1280px) { ... }

  '2xl': '1536px',
  // => @media (min-width: 1536px) { ... }
*/

//Watch all media query changes

export function listenMediaQueries(
  callback: (match: number) => void,
  queries: number[] = [640, 768, 1024, 1280, 1536]
) {
  const disposers = queries.map((query) => {
    const mediaQuery = window.matchMedia(`(min-width: ${query}px)`)
    const onChange = () => callback(query)
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  })

  return () => disposers.forEach((dispose) => dispose())
}
