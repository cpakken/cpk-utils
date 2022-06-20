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

// export function isBaseMap<K, V>(test: BaseMap<K, V> | ReadOnlyMap<K, V>): test is BaseMap<K, V> {
//   return (test as any).set instanceof Function
// }

// export abstract class MapProps<K, V> implements ReadOnlyMapProps<K, V> {
//   abstract get size(): number
//   abstract get(key: any): V | undefined
//   abstract has(key: any): boolean
//   abstract keys(): IterableIterator<K>
//   *values(): IterableIterator<V> {
//     for (let k of this.keys()) yield this.get(k) as V
//   }
//   *entries(): IterableIterator<[K, V]> {
//     for (let k of this.keys()) yield [k, this.get(k) as V]
//   }
//   forEach(fn: (v: V, k: K) => void) {
//     for (const [key, value] of this.entries()) fn(value, key)
//   }
// }

export class DerivedMap<K, P, V> {
  base: ReadOnlyMapProps<K, P>

  // abstract get(key: any): V | undefined

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
  forEach(fn: (v: V, k: K) => void) {
    for (const [key, value] of this.entries()) fn(value, key)
  }
}
