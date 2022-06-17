import { isNonPrimative } from '../common'

type Cache = WeakMap<object, any>

// Used to access the cache of a memoized function
const weakMemoedFnCache = new WeakMap<Function, Cache>()
//Key in cache to store replace cache setter fn
const $replace = {} //Since we can't use symbol as weakmap key, we use an object to represent it

/**
 * Weakly memoize a function with zero/one arguments. Caches the result if the argument is non-primative
 * @param fn function to be weakly memoized
 * @returns memoized function
 */
export function weakMemo<FN extends (arg?: any) => any>(fn: FN): FN {
  let cache: Cache = new WeakMap()

  function memoed(arg?: any) {
    if (arguments.length === 0) {
      //If no arguments, use own fn as key
      if (cache.has(memoed)) {
        return cache.get(memoed)!
      } else {
        const result = fn()
        cache.set(memoed, result)
        return result
      }
    }
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
  }

  weakMemoedFnCache.set(memoed, cache)
  cache.set($replace, () => (cache = new WeakMap()))

  return memoed as FN
}

/**
 * Clear the memoized cache of a function. Can specify an argument to clear the cache for that argument
 * @param memoedFn memoized function
 * @param arg if arg is undefined, clear result with no arguments. If arg is missing, clear all results
 */
export function clearWeakMemo(memoedFn: (arg?: any) => any, arg?: object) {
  const cache = weakMemoedFnCache.get(memoedFn)
  if (cache) {
    if (arguments.length > 1) cache.delete(arg === undefined ? memoedFn : arg)
    else cache.get($replace)()
  }
}
