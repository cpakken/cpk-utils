// Inspiration
// https://github.com/pacocoursey/next-themes/blob/master/index.tsx
// https://github.com/donavon/use-dark-mode
// https://usehooks.com/useDarkMode

import { createContext, FC, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ColorMode, ColorThemes, ThemeProviderProps, UseThemeProps } from './types'
import { useLocalStorage, useUpdateClassName, useConstant } from '../hooks'

const ThemeContext = createContext<UseThemeProps>({
  colorThemes: {},
  theme: 'light-theme',
  colorMode: 'light',
  setColorMode: (_) => {},
  toggle: () => {},
})

// export const useThemeClass = (light: string, dark: string) => {
//   return useTheme().colorMode === 'light' ? light : dark
// }

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider: React.FC<ThemeProviderProps> = (props) => {
  const {
    children,
    colorThemes = {},
    initialColorMode,
    storageKey = 'colorMode',
    element,
    disableTransitionOnChange = false,
  } = props

  // const initColorMode = useConstant(() => inferNoFlashColorMode() ?? initialColorMode ?? getPrefersColorMode())
  const initColorMode = useConstant(() => initialColorMode ?? getPrefersColorMode())
  const [colorMode, setColorMode] = useLocalStorage(storageKey, initColorMode)

  //Update colorMode when system color mode changes
  useEffect(() => {
    const onColorSchemeChange = () => setColorMode(getPrefersColorMode())
    const matchMedia = window.matchMedia(preferDarkQuery)

    // Intentionally use deprecated listener methods to support iOS & old browsers
    // media.addListener(handler)
    matchMedia.addEventListener('change', onColorSchemeChange)

    return () => {
      //media.removeListener(handler)
      matchMedia.removeEventListener('change', onColorSchemeChange)
    }
  }, [])

  //Update element theme class when color mode changes
  useUpdateClassName(colorThemes?.[colorMode], { disableTransitionOnChange, element })

  const toggle = useCallback(() => setColorMode((mode) => (mode === 'light' ? 'dark' : 'light')), [])
  const theme = colorThemes?.[colorMode] || colorMode

  return (
    <ThemeContext.Provider value={{ theme, colorMode, setColorMode, toggle, colorThemes }}>
      {children}
    </ThemeContext.Provider>
  )
}

const preferDarkQuery = '(prefers-color-scheme: dark)'

function getPrefersColorMode(): ColorMode {
  return globalThis?.matchMedia?.(preferDarkQuery).matches ? 'dark' : 'light'
}

export const useThemeContainer = (initialColorMode: ColorMode, overideColorThemes?: ColorThemes) => {
  const { colorThemes: _colorThemes } = useTheme()
  const colorThemes = overideColorThemes ?? _colorThemes

  const ThemeContainer: FC<{}> = useMemo(
    () =>
      ({ children }) => {
        const [colorMode, setColorMode] = useState(initialColorMode)
        const theme = useMemo(() => colorThemes[colorMode]!, [colorMode, colorThemes])
        const toggle = useCallback(() => setColorMode((colorMode) => (colorMode === 'light' ? 'dark' : 'light')), [])

        return (
          <ThemeContext.Provider value={{ colorMode, colorThemes, setColorMode, toggle, theme }}>
            <div className={theme}>{children}</div>
          </ThemeContext.Provider>
        )
      },
    [colorThemes, initialColorMode]
  )

  return ThemeContainer
}
