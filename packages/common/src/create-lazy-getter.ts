//https://github.com/xaviergonz/mobx-keystone/blob/master/packages/lib/src/utils/mapUtils.ts

//IS this redundant with weakMemoize performing the same function?

type AnyMap<V = any> = Map<any, V> | WeakMap<any, V>

export function getOrCreate<K, V, C = V>(map: Map<K, V>, key: K, create: () => C): V
export function getOrCreate<K extends object, V, C = V>(map: WeakMap<K, V>, key: K, create: () => C): V

export function getOrCreate<V>(map: AnyMap<V>, key: any, create: () => V) {
  let value = map.get(key)
  if (value === undefined) {
    value = create()
    map.set(key, value)
  }
  return value
}

// lazy and tree shakable properties for object (i.e. getPatches, getRoot, getPath)
export function createLazyGetter<K, V, C = V>(map: Map<K, V>, create: () => C): (key: K) => V
export function createLazyGetter<K extends object, V, C = V>(map: WeakMap<K, V>, create: () => C): (key: K) => V
export function createLazyGetter<V>(map: AnyMap<V>, create: () => V) {
  return (key: any) => {
    let value = map.get(key)
    if (value === undefined) {
      value = create()
      map.set(key, value)
    }
    return value
  }
}
