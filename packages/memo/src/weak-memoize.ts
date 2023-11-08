import { isPrimative } from '@cpk-utils/is'

type Cache = WeakMap<object, any>

export type WeakMemo<FN extends (arg: any) => any> = FN & {
  peek: (arg?: ArgType<FN>) => ReturnType<FN> | undefined
  clear: (arg: ArgType<FN> | null) => boolean
  reset: () => void
}

type ArgType<FN> = FN extends (arg: infer A) => any ? A : never

/**
 * Weakly memoize a function with zero/one arguments. Caches the result if the argument is non-primative
 * @param fn function to be weakly memoized
 * @returns memoized function
 */
export function weakMemo<FN extends (arg?: any) => any>(fn: FN): WeakMemo<FN> {
  type A = ArgType<FN>
  type T = ReturnType<FN>

  let cache = new WeakMap<A | typeof $noArg, T>()

  function memoedFn(arg?: any) {
    const { length } = arguments

    if (length === 0) {
      //If no arguments
      if (cache.has($noArg)) {
        return cache.get($noArg)!
      } else {
        const result = fn()
        cache.set($noArg, result)
        return result
      }
    }

    if (length > 1) {
      //Don't cache
      //TODO throw error?
      return fn(...arguments)
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

  return Object.assign(memoedFn, {
    peek(arg?: A) {
      return cache.get(arg === undefined ? $noArg : arg)
    },
    clear(arg: A | null) {
      cache.delete(arg === null ? $noArg : arg)
    },
    reset() {
      cache = new WeakMap()
      weakMemoedFnCache.set(memoedFn, cache)
    },
  }) as any
}

export function isWeakMemoFn(fn: (arg?: any) => any): boolean {
  return fn && weakMemoedFnCache.has(fn)
}

// Used to access the cache of a memoized function
const weakMemoedFnCache = new WeakMap<Function, Cache>()

//Use object as key since symbol can't be a key in weakMap
const $noArg = {}
