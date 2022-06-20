export interface ReadOnlyMapProps<K, V> {
  readonly size: number
  has(key: any): boolean
  get(key: any): V | undefined
  keys(): IterableIterator<K>
  // values(): IterableIterator<V>
  // entries(): IterableIterator<[K, V]>
  // forEach(fn: (v: V, k: K) => void): void
}

export interface BaseMap<K, V> extends ReadOnlyMapProps<K, V> {
  set(key: K, value: V): this
  delete(key: K): boolean
}

export class DerivedMap<K, P, V> implements ReadOnlyMapProps<K, V> {
  base: ReadOnlyMapProps<K, P>

  constructor(map: ReadOnlyMapProps<K, P>, readonly get: (key: K) => V | undefined) {
    this.base = map
  }

  get size() {
    return this.base.size
  }
  has(key: any) {
    return this.base.has(key)
  }
  keys() {
    return this.base.keys()
  }

  *values(): IterableIterator<V> {
    for (let k of this.keys()) yield this.get(k) as V
  }
  *entries(): IterableIterator<[K, V]> {
    for (let k of this.keys()) yield [k, this.get(k) as V]
  }
  forEach(fn: (value: V, key: K, map: DerivedMap<K, P, V>) => void) {
    for (const [key, value] of this.entries()) fn(value, key, this)
  }
}

export function deriveMap<K, P, V>(map: ReadOnlyMapProps<K, P>, mapFn: (value: P, key: K) => V): DerivedMap<K, P, V> {
  return new DerivedMap(map, (key) => {
    return map.has(key) ? mapFn(map.get(key)!, key) : undefined
  })
}
