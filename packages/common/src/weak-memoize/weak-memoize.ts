import { isPrimative } from '../common'

type Cache = WeakMap<object, any>

// Used to access the cache of a memoized function
const weakMemoedFnCache = new WeakMap<Function, Cache>()

//Use object as key since symbol can't be a key in weakMap
const $noArg = {}
const $init = {} //Used as key to store setter fn to

/**
 * Weakly memoize a function with zero/one arguments. Caches the result if the argument is non-primative
 * @param fn function to be weakly memoized
 * @returns memoized function
 */
export function weakMemo<FN extends (arg?: any) => any>(fn: FN): FN {
  let cache: Cache
  //Used to reset cache since .clear() is unavailable in WeakMap
  const initCache = () => {
    cache = new WeakMap([[$init, initCache]])
    weakMemoedFnCache.set(memodFn, cache)
  }

  function memodFn(arg?: any) {
    if (arguments.length === 0) {
      //If no arguments, use own fn as key
      if (cache.has($noArg)) {
        return cache.get($noArg)!
      } else {
        const result = fn()
        cache.set($noArg, result)
        return result
      }
    }

    if (cache.has(arg)) {
      return cache.get(arg)!
    } else {
      if (isPrimative(arg)) return fn(arg) //Don't memoize primitives
      const result = fn(arg)
      cache.set(arg, result)
      return result
    }
  }

  initCache()
  return memodFn as FN
}

export function isWeakMemoFn(fn: (arg?: any) => any): boolean {
  return fn && weakMemoedFnCache.has(fn)
}

/**
 * Clear the memoized cache of a function. Can specify an argument to clear the cache for that argument
 * @param memoedFn memoized function
 * @param arg if arg is undefined, clear result with no arguments. If arg is missing, clear all results
 */
export function clearWeakMemo(memoedFn: (arg?: any) => any, arg?: object) {
  const cache = weakMemoedFnCache.get(memoedFn)
  if (cache) {
    if (arguments.length > 1) cache.delete(arg === undefined ? $noArg : arg)
    else cache.get($init)()
  } else {
    throw new Error('Function not memoized')
  }
}
