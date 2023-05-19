export type Primatives = string | number | boolean | symbol | undefined | null | bigint
// export type NonPrimative<T> = T extends Primatives ? never : T
export type NonPrimative<T> = T extends object ? T : never

const nonPrimativeTypes = new Set(['object', 'function'])

export function isNonPrimative<T>(thing: T): thing is NonPrimative<T> {
  // return thing === null ? false : !primativeTypes.has(typeof thing)
  return thing === null ? false : nonPrimativeTypes.has(typeof thing)
  // return thing instanceof Object
}

const primativeTypes = new Set(['string', 'number', 'boolean', 'symbol', 'undefined', 'null', 'bigint'])
export function isPrimative<T>(thing: T): thing is Extract<T, Primatives> {
  return thing === null ? true : primativeTypes.has(typeof thing)
}

// export function isFunction(thing: any): thing is Function {
export function isFunction<T>(thing: T): thing is T extends Function ? T : never {
  return typeof thing === 'function'
  // return thing instanceof Function
}
