import { isPrimative } from '../common'

type Cache = WeakMap<object, any>

const $noArg = {}
const memoFnCacheMap = new WeakMap<Function, Cache>()

/**
 * When the arguments are non-primative, the result is cached
 * @param fn function to be weakly memoized
 * @returns memoized function
 */
export function weakMemoDeep<FN extends (...args: any[]) => any>(fn: FN, _cache?: Cache): FN {
  let cache: Cache = _cache || new WeakMap()

  function memoized(...args) {
    const arg = args[0]

    if (args.length === 0) {
      //If no arguments, use $noArg as key
      if (cache.has($noArg)) {
        return cache.get($noArg)!
      } else {
        const result = fn()
        cache.set($noArg, result)
        return result
      }
    }
    if (args.length === 1) {
      if (cache.has(arg)) {
        const resultOrFn = cache.get(arg)!
        return isWeakMemoDeepFn(resultOrFn) ? resultOrFn() : resultOrFn
      } else {
        if (isPrimative(arg)) return fn(arg) //Don't memoize primitives

        const result = fn(arg)
        cache.set(arg, result)
        return result
      }
    } else {
      //Arguments > 1
      if (cache.has(arg)) {
        const resultOrFn = cache.get(arg)
        if (isWeakMemoDeepFn(resultOrFn)) {
          //memoed is the curried memoized function
          return resultOrFn(...args.slice(1))
        } else {
          //create and cache curried memoized fn with 0 arguments result initialized (own function is used as key)
          const curried = weakMemoDeep(
            (...args: any[]) => fn(arg, ...args),
            new WeakMap([[$noArg, resultOrFn]])
          )

          cache.set(arg, curried)
          return curried(...args.slice(1))
        }
      } else {
        if (isPrimative(arg)) return fn(...args) //Don't memoize primitives

        //create and cache curried memoized fn
        const nextFn = weakMemoDeep((...args) => fn(arg, ...args))
        cache.set(arg, nextFn)
        return nextFn(...args.slice(1))
      }
    }
  }

  memoFnCacheMap.set(memoized, cache)
  return memoized as FN
}

export function isWeakMemoDeepFn(memoedFn: (...args: any[]) => any): boolean {
  return memoedFn && memoFnCacheMap.has(memoedFn)
}
