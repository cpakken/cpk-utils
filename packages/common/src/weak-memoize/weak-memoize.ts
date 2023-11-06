import { isPrimative } from '../common'

type Cache = WeakMap<object, any>

// Used to access the cache of a memoized function
const weakMemoedFnCache = new WeakMap<Function, Cache>()

//Use object as key since symbol can't be a key in weakMap
const $noArg = {}

/**
 * Weakly memoize a function with zero/one arguments. Caches the result if the argument is non-primative
 * @param fn function to be weakly memoized
 * @returns memoized function
 */

export function weakMemo<T>(fn: () => T): {
  (): T
  peek: () => T | undefined
  delete: () => void
  clear: () => void
}

export function weakMemo<A extends object, T>(
  fn: (arg: A) => T
): {
  (arg: A): T
  peek: (arg: A) => T | undefined
  delete: (arg: A) => boolean
  clear: () => void
}

export function weakMemo<A extends object, T>(
  fn: (arg?: A) => T
): {
  (arg?: A): T
  peek: (arg?: A) => T | undefined
  delete: (arg?: A) => boolean
  clear: () => void
}

export function weakMemo<A extends object, T>(
  fn: (arg?: A) => T
): {
  (arg?: A): T
  peek: (arg?: A) => T | undefined
  delete: (arg?: A) => boolean
  clear: () => void
} {
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
    delete(arg?: A) {
      cache.delete(arg === undefined ? $noArg : arg)
    },
    clear() {
      cache = new WeakMap()
      weakMemoedFnCache.set(memoedFn, cache)
    },
  }) as any
}

export function isWeakMemoFn(fn: (arg?: any) => any): boolean {
  return fn && weakMemoedFnCache.has(fn)
}
