export function compareArrays(a: any[], b: any[]) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export function arrayify<T>(value: T | T[]) {
  return Array.isArray(value) ? value : [value]
}
