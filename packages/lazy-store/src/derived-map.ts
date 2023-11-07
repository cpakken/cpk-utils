export interface ReadOnlyMapProps<K, V> {
  readonly size: number
  has(key: K): boolean
  get(key: K): V | undefined
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
  declare get: (key: K) => V | undefined

  constructor(readonly base: ReadOnlyMapProps<K, P>, readonly derive: (value: P, key: K) => V) {
    this.get = (key: K) => (base.has(key) ? derive(base.get(key)!, key) : undefined)
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
