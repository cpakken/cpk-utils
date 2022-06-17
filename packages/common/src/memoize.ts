//https://github.com/xaviergonz/mobx-keystone/blob/master/packages/lib/src/utils/mapUtils.ts

//IS this redundant with weakMemoize performing the same function?

// type AnyMap<V = any> = Map<any, V> | WeakMap<any, V>

// export function getOrCreate<K, V, C = V>(map: Map<K, V>, key: K, create: () => C): V
// export function getOrCreate<K extends object, V, C = V>(map: WeakMap<K, V>, key: K, create: () => C): V

// export function getOrCreate<V>(map: AnyMap<V>, key: any, create: () => V) {
//   let value = map.get(key)
//   if (value === undefined) {
//     value = create()
//     map.set(key, value)
//   }
//   return value
// }

type Cache = Map<any, any>
const memoFnCache = new WeakMap<Function, Cache>()

export function memoize<FN extends (arg: any) => any>(fn: FN): FN {
  const cache: Cache = new Map()

  const memoed = (key: any) => {
    if (cache.has(key)) {
      return cache.get(key)!
    } else {
      const value = fn(key)
      cache.set(key, value)
      return value
    }
  }

  memoFnCache.set(memoed, cache)

  return memoed as FN
}

/**
 * Clear the memoized cache of a function. Can specify an argument to clear the cache for that argument
 * @param memoedFn memoized function
 * @param arg clear result of speicific argument. If arg is missing, clear all results
 */
export function clearMemoize(memoedFn: (arg?: any) => any, arg?: any) {
  const cache = memoFnCache.get(memoedFn)
  if (cache) {
    if (arguments.length > 1) cache.delete(arg)
    else cache.clear()
  }
}
