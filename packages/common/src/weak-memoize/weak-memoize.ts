import { isNonPrimative } from '../common'

/**
 * Weakly memoize a function with zero/one arguments. Caches the result if the argument is non-primative
 * @param fn function to be weakly memoized
 * @returns memoized function
 */
export function weakMemo<FN extends (arg?: any) => any>(fn: FN): FN {
  const cache = new WeakMap<any, any>()

  return function (arg?: any) {
    if (arguments.length === 0) {
      //If no arguments, use own fn as key
      if (cache.has(fn)) {
        return cache.get(fn)!
      } else {
        const result = fn()
        cache.set(fn, result)
        return result
      }
    }
    // if (arg instanceof Object) {
    if (isNonPrimative(arg)) {
      if (cache.has(arg)) {
        return cache.get(arg)!
      } else {
        const result = fn(arg)
        cache.set(arg, result)
        return result
      }
    } else {
      //Don't memoize primitives
      return fn(arg)
    }
  } as FN
}
