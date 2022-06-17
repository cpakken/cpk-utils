export type ColorMode = 'light' | 'dark'
export type ColorThemes = Partial<Record<ColorMode, string>>

export interface ThemeProviderProps {
  /** define theme class keys for dark and light modes */
  colorThemes?: ColorThemes

  /** Initial Color Mode, if not defined then default to system preference (prefersColorScheme) */
  initialColorMode?: ColorMode

  /** Disable all CSS transitions when switching themes, default false */
  disableTransitionOnChange?: boolean

  /** Key used to store theme setting in localStorage, defaults to 'colorTheme' */
  storageKey?: string

  /** Element where class name is updated, defaults to `document.documentElement` */
  element?: HTMLElement
}

export interface UseThemeProps {
  /** Active theme name (class name) */
  theme: string
  /** Active color mode */
  colorMode: ColorMode
  /** Color Theme Config (Will change during HMR) */
  colorThemes: ColorThemes
  /** Update the theme */
  setColorMode: (mode: ColorMode) => void
  /** Toggle between light and dark color modes */
  toggle(): void
}
