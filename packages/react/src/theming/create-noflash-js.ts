//Sets theme classname onto documentElement before it is rendered

export const createNoFlashJS = ({ darkTheme, lightTheme }) => `!(function () {
  var e = '${darkTheme}',
    a = '${lightTheme}',
    o = document.documentElement
  function r(r) {
    o.classList.add(r ? e : a), o.classList.remove(r ? a : e)
  }
  var t = window.matchMedia('(prefers-color-scheme: dark)'),
    c = '(prefers-color-scheme: dark)' === t.media,
    s = null
  try {
    s = localStorage.getItem('colorMode')
  } catch (e) {}
  var l = null !== s
  if ((l && (s = JSON.parse(s)), l)) r('dark' === s)
  else if (c) r(t.matches)
  else {
    var d = o.classList.contains(e)
    localStorage.setItem('colorMode', JSON.stringify(d))
  }
})()`
