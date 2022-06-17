// Insert this script in your index.html right after the <body> tag.
// This will help to prevent a flash if dark mode is the default.

;(function () {
  // Change these if you use something different in your hook.
  var storageKey = 'colorMode'
  var classNameDark = 'dark-mode'
  var classNameLight = 'light-mode'

  var el = document.documentElement

  function setClassOnDocument(isDark) {
    el.classList.add(isDark ? classNameDark : classNameLight)
    el.classList.remove(isDark ? classNameLight : classNameDark)
    // el.attributes.setNamedItem('data-theme', isDark ? 'dark' : 'light')
  }
  //check if data-ssr-theme is set
  // var ssr = el.getAttribute('data-ssr-theme')
  // if (ssr) return setClassOnDocument(ssr)

  var preferDarkQuery = '(prefers-color-scheme: dark)'
  var mql = window.matchMedia(preferDarkQuery)
  var supportsColorSchemeQuery = mql.media === preferDarkQuery
  var localStorageTheme = null
  try {
    localStorageTheme = localStorage.getItem(storageKey)
  } catch (err) {}
  var localStorageExists = localStorageTheme !== null
  if (localStorageExists) {
    localStorageTheme = JSON.parse(localStorageTheme)
  }

  // Determine the source of truth
  if (localStorageExists) {
    // source of truth from localStorage
    // setClassOnDocument(localStorageTheme)
    setClassOnDocument(localStorageTheme === 'dark')
  } else if (supportsColorSchemeQuery) {
    // source of truth from system
    setClassOnDocument(mql.matches)
    // localStorage.setItem(storageKey, mql.matches)
  } else {
    var isDarkMode = el.classList.contains(classNameDark)
    localStorage.setItem(storageKey, JSON.stringify(isDarkMode))
  }
})()
