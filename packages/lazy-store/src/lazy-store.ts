import { DerivedMap, ReadOnlyMapProps } from './derived-map'
import { clearWeakMemo, weakMemo } from '@cpk-utils/memo'

export class LazyMap<K, P, V> extends DerivedMap<K, P, V> {
  declare readonly mapFn: (parentValue: P) => V

  constructor(base: ReadOnlyMapProps<K, P>, mapFn: (parentValue: P) => V) {
    super(base, weakMemo(mapFn))
  }

  reset(...keyArg: [K] | []) {
    //spread key since clearWeakMemo will clear all if it has no key
    return clearWeakMemo(this.mapFn, ...keyArg.map((key: K) => this.base.get(key)! as any))
  }
}

export interface LazyStore<V> extends LazyMap<string, any, V> {}

export function lazyStore<P extends object, V>(
  base: ReadOnlyMapProps<string, P>,
  mapFn: (parentValue: P) => V
): LazyStore<V> {
  return new LazyMap(base, mapFn)
}