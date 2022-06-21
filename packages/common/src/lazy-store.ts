import { DerivedMap, ReadOnlyMapProps } from './derived-map'
import { clearWeakMemo, weakMemo } from './weak-memoize'

export class LazyMap<K, P, V> extends DerivedMap<K, P, V> {
  readonly mapFn: (parentValue: P) => V

  constructor(base: ReadOnlyMapProps<K, P>, mapFn: (parentValue: P) => V) {
    const memoedMapFn = weakMemo(mapFn)
    super(base, (key) => (base.has(key) ? memoedMapFn(base.get(key)!) : undefined))

    this.mapFn = memoedMapFn
  }

  reset(...keyArg: [K] | []) {
    //spread key since clearWeakMemo will clear all if it has no key
    return clearWeakMemo(this.mapFn, ...keyArg.map((key: K) => this.base.get(key)!))
  }
}

export interface LazyStore<V> extends LazyMap<string, any, V> {}

export function lazyStore<P extends object, V>(
  baseStore: ReadOnlyMapProps<string, P>,
  mapFn: (parentValue: P) => V
): LazyStore<V> {
  return new LazyMap(baseStore, mapFn)
}
