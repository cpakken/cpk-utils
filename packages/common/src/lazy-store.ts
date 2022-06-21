import { DerivedMap, ReadOnlyMapProps } from './derived-map'
import { clearWeakMemo, weakMemo } from './weak-memoize'

export class LazyMap<K, P, V> extends DerivedMap<K, P, V> {
  declare readonly mapFn: (parentValue: P) => V

  constructor(base: ReadOnlyMapProps<K, P>, mapFn: (parentValue: P) => V) {
    super(base, weakMemo(mapFn))
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
