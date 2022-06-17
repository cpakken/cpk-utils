import { isNonPrimative } from '../common'

type Cache = WeakMap<any, any>

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

export function clearMemo(memoedFn: (arg?: any) => any, arg?: object) {
  const cache = weakMemoedFnCache.get(memoedFn)
  if (cache) {
    if (arg) {
      cache.delete(arg)
    } else {
      cache.get($replace)()
    }
  }
}
