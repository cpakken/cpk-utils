import { DerivedMap, ReadOnlyMapProps } from '@cpk-utils/common'
import { createTransformer } from './createTransformer'
import { isObservableMap, computed } from 'mobx'
import { keepAlive } from './keepAlive'

export type IMapFn<K, V, R> = (v: V, k: K) => R

export interface SmartMapOptions<Parent, Result> {
  eager?: boolean
  onCleanup?(result: Result, source: Parent): void
  useTransformer?: boolean //defaults true
  requiresReaction?: boolean
}

export class SmartMap<Key, Parent, Result> extends DerivedMap<Key, Parent, Result> {
  readonly dispose: () => void

  constructor(
    map: ReadOnlyMapProps<Key, Parent>,
    mapFn: IMapFn<Key, Parent, Result>,
    opts: SmartMapOptions<Parent, Result> = {}
  ) {
    const { eager, onCleanup, requiresReaction = false, useTransformer = true } = opts

    if (onCleanup) {
      if (mapFn.length > 1) throw new Error('onCleanup enabled, mapFn only supports passing the value (1 argument)')
      if (!useTransformer) throw new Error('when onCleanup is enabled, a tranasformer must be used')
      // if (isTransformer(mapFn)) throw new Error(`onCleanup cannot be applied to ${mapFn} since it is already a transformer`)

      const transformer = createTransformer(mapFn as (arg: Parent) => Result, { onCleanup, requiresReaction })
      const get = (key: Key) => (map.has(key) ? transformer(map.get(key)!) : undefined)
      super(map, get)
    } else {
      const _get = (key: Key) => (map.has(key) ? mapFn(map.get(key)!, key) : undefined)
      const get = useTransformer ? createTransformer(_get) : _get
      super(map, get)
      // this.get = (isTransformer(mapFn) || !useTransformer) ? _get : createTransformer(_get)
    }

    if (eager) {
      this.dispose = keepAlive(
        computed(() => {
          for (let val of this.values()) val
        })
      )
    }
  }

  smartMap<Next>(_mapFn: IMapFn<Key, Result, Next>, opts?: SmartMapOptions<Result, Next>) {
    return new SmartMap(this, _mapFn, opts)
  }
}

export interface ISmartMap<Value> extends SmartMap<string, any, Value> {}
export function smartmap<Key, Parent, Result>(
  map: ReadOnlyMapProps<Key, Parent>,
  mapFn: IMapFn<Key, Parent, Result>,
  opts: SmartMapOptions<Parent, Result> = {}
) {
  if (!isObservableMap(map)) throw new Error(`${map} must be observable. Try observable.map() or use mst maps`)
  return new SmartMap(map, mapFn, opts)
}
