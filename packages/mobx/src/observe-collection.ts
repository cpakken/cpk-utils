import {
  get,
  IArrayDidChange,
  IMapDidChange,
  IObjectDidChange,
  IObservableArray,
  ISetDidChange,
  isObservableArray,
  isObservableMap,
  isObservableObject,
  isObservableSet,
  keys,
  ObservableMap,
  ObservableSet,
  observe,
} from 'mobx'
import type { MaybeDisposer } from './types'

export type KeyObservableCollection<V = any> = Record<string, V> | ObservableMap<string, V> | IObservableArray<V>
export type ObservableCollection<V = any> = KeyObservableCollection<V> | ObservableSet<V>

export type IKeyCollectionDidChange<T> = ISetDidChange<T> | IMapDidChange<any, T> | IObjectDidChange<any>
export function isObservableCollection(obj: any): obj is ObservableCollection {
  return isObservableObject(obj) || isObservableMap(obj) || isObservableArray(obj) || isObservableSet(obj)
}

export function onChildAttachedTo<T>(
  collection: ObservableCollection<T>,
  onAttach: (child: T, key: any, prevChild: T | undefined) => (() => void) | void,
  fireForCurrentChildren = true
) {
  return observeCollection(collection, { onAttach }, fireForCurrentChildren)
}

export type CollectionObserveHandlers<T> = {
  /**
   * @param child added or updated item
   * @param prevChild if defined, then child is 'updated', else 'added'
   */
  onAttach?: (child: T, key: any, prevChild: T | undefined) => (() => void) | void
  onDetach?: (child: T, key: any) => void
  onIndex?: (child: T, newIndex: number, oldIndex: number) => void
}

export function observeCollection<T>(
  collection: ObservableCollection<T>,
  handlers: CollectionObserveHandlers<T>,
  fireForCurrentChildren = true
) {
  const { onAttach, onDetach, onIndex } = handlers

  if (isObservableArray(collection)) {
    return observeMobxArray(collection, onAttach, onDetach, onIndex, fireForCurrentChildren)
  } else {
    return observeMobxKeyCollection(collection, onAttach, onDetach, fireForCurrentChildren)
  }
}

//Non-array collections (uses keys instead of indexies)
function observeMobxKeyCollection<T>(
  collection: Object | ObservableMap<any, T> | ObservableSet<T>,
  onAttach?: (child: T, key: string | T, prev?: T) => MaybeDisposer,
  onDetach?: (child: T, key: string | T) => void,
  fireForCurrentChildren = true
) {
  const disposers: Map<PropertyKey | T, MaybeDisposer> = new Map()

  //Since mobx observe does not support fireImmediately for objects, do manually
  if (fireForCurrentChildren && onAttach) {
    if (isObservableSet(collection)) {
      for (const item of collection) {
        disposers.set(item, onAttach(item, item))
      }
    } else {
      for (const key of keys(collection)) {
        const item = get(collection, key as string)
        disposers.set(key, onAttach(item, key as string))
      }
    }
  }

  const observer = (change: IKeyCollectionDidChange<T>) => {
    switch (change.type) {
      case 'add': {
        const key = change.observableKind === 'set' ? change.newValue : change.name

        if (onAttach) disposers.set(key, onAttach(change.newValue, key))
        break
      }
      case 'update':
        //dispose old value

        disposers.get(change.name)?.()
        disposers.delete(change.name)

        //init new value
        if (onAttach) disposers.set(change.name, onAttach(change.newValue, change.name, change.oldValue))
        break

      case 'delete': // map
      case 'remove': // object
        const key = change.observableKind === 'set' ? change.oldValue : change.name
        disposers.get(key)?.()
        disposers.delete(key)

        onDetach?.(change.oldValue, key)
        break
    }
  }

  const stopObserve = observe(collection, observer)
  // const stopObserve = collection.observe_(observer)
  // const stopObserve = collection.intercept_(observer)

  return (runPendingDisposers: boolean = true) => {
    stopObserve()
    if (runPendingDisposers) {
      disposers.forEach((disposer) => disposer?.())
    }
  }
}

function observeMobxArray<T>(
  array: IObservableArray<T>,
  onAttach?: (child: T, index: number, prev?: T) => MaybeDisposer,
  onDetach?: (child: T, orginalIndex: number) => void,
  onIndex?: (child: T, newIndex: number, oldIndex: number) => void,
  fireForCurrentChildren = true
) {
  const disposers: Array<MaybeDisposer> = []
  if (fireForCurrentChildren && onAttach) {
    array.forEach((item, index) => disposers.push(onAttach(item, index)))
  }

  const observer = (change: IArrayDidChange<T>) => {
    const { index } = change

    switch (change.type) {
      case 'update':
        if (onAttach) {
          //dispose old value
          disposers[index]?.()
          disposers[index] = undefined

          //init new value
          disposers[index] = onAttach(change.newValue, index, change.oldValue)
        }
        break
      case 'splice':
        //Update indexes
        const diff = change.addedCount - change.removedCount
        if (onIndex && diff !== 0) {
          const array = change.object

          for (let i = index + change.addedCount; i < array.length; i++) {
            onIndex(array[i], i, i - diff)
          }
        }

        //Dispose removed items
        change.removed.forEach((item, removeIndex) => {
          const i = index + removeIndex
          disposers[i]?.()
          onDetach?.(item, i)
        })

        if (onAttach) {
          //Sync disposer index
          disposers.splice(change.index, change.removedCount)
          //Init added items
          const addedDisposers = change.added.map((item, offsetIndex) => onAttach(item, index + offsetIndex))
          disposers.splice(change.index, 0, ...addedDisposers)
        }

        break
    }
  }

  const stopObserve = observe(array, observer)
  // const stopObserve = array.observe_(observer)
  // const stopObserve = array.intercept_(observer)

  return (runPendingDisposers: boolean = true) => {
    stopObserve()
    if (runPendingDisposers) {
      disposers.forEach((disposer) => disposer?.())
    }
  }
}
