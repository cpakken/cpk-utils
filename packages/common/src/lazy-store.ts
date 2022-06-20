import { deriveMap, ReadOnlyMapProps } from './derived-map'
import { weakMemo } from './weak-memoize'

export interface LazyStore<V> extends ReadOnlyMapProps<string, V> {}

export function lazyStore<P extends object, V>(
  baseStore: ReadOnlyMapProps<string, P>,
  mapFn: (parentValue: P) => V
): LazyStore<V> {
  return deriveMap(baseStore, weakMemo(mapFn))
}
