import { isNonPrimative } from '../common'

/**
 * When the arguments are non-primative, the result is cached
 * @param fn function to be weakly memoized
 * @returns memoized function
 */
export function weakMemoDeep<FN extends (...args: any[]) => any>(fn: FN, cache = new WeakMap()): FN {
  function memoized(...args) {
    const arg = args[0]

    if (args.length === 0) {
      //If no arguments, use own fn as key (result is garbage collected when fn is)
      if (cache.has(fn)) {
        return cache.get(fn)!
      } else {
        const result = fn()
        cache.set(fn, result)
        return result
      }
    } else if (isNonPrimative(arg)) {
      if (args.length === 1) {
        if (cache.has(arg)) {
          const resultOrFn = cache.get(arg)!
          return isWeakMemoizedFn(resultOrFn) ? resultOrFn() : resultOrFn
        } else {
          const result = fn(arg)
          cache.set(arg, result)
          return result
        }
      } else {
        //Arguments > 1
        if (cache.has(arg)) {
          const resultOrFn = cache.get(arg)
          if (isWeakMemoizedFn(resultOrFn)) {
            //memoed is the curried memoized function
            return resultOrFn(...args.slice(1))
          } else {
            //create and cache curried memoized fn with 0 arguments result initialized (own function is used as key)
            const _curried = (...args: any[]) => fn(arg, ...args)
            const curried = weakMemoDeep(_curried, new WeakMap([[_curried, resultOrFn]]))

            cache.set(arg, curried)
            return curried(...args.slice(1))
          }
        } else {
          //create and cache curried memoized fn
          const nextFn = weakMemoDeep((...args) => fn(arg, ...args))
          cache.set(arg, nextFn)
          return nextFn(...args.slice(1))
        }
      }
    } else {
      //Don't memoize primitives
      return fn(...args)
    }
  }

  return Object.assign(memoized, { [$memoize]: cache }) as any
  // return Object.defineProperty(memoized, $memoize, { value: cache }) as any
}

const $memoize = Symbol('memoize')

export function isWeakMemoizedFn(fn: (...args: any[]) => any): boolean {
  return Boolean(fn && fn[$memoize])
}

export function clearMemoizedCache(fn: (...args: any[]) => any) {
  if (isWeakMemoizedFn(fn)) {
    fn[$memoize].clear()
  }
}

//TODO if more than one argument, store recursive function
