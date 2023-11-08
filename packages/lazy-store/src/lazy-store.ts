import { DerivedMap, ReadOnlyMapProps } from './derived-map'
import { WeakMemo, weakMemo } from '@cpk-utils/memo'

export class LazyMap<K, P extends object, V> extends DerivedMap<K, P, V> {
  declare readonly derive: WeakMemo<(value: P) => V>

  constructor(base: ReadOnlyMapProps<K, P>, mapFn: (parentValue: P) => V) {
    const memoedFn = weakMemo(mapFn)
    super(base, memoedFn)
  }

  clear(key: K) {
    const derivedKey = this.base.get(key)
    if (!derivedKey) throw new Error(`Key ${key} not found in base map`)
    return this.derive.clear(derivedKey)
  }

  reset() {
    this.derive.reset()
  }
}

export interface LazyStore<V> extends LazyMap<string, any, V> {}

export function lazyStore<P extends object, V>(
  base: ReadOnlyMapProps<string, P>,
  mapFn: (parentValue: P) => V
): LazyStore<V> {
  return new LazyMap(base, mapFn)
}
