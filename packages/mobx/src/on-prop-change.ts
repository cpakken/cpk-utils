import { isFunction } from '@cpk-utils/common'
import { IObservableValue, _getAdministration } from 'mobx'
import { type MaybeDisposer } from './observe-collection'

export function onPropChange<T, K extends keyof T>(
  observable: IObservableValue<T>,
  fn: (newValue: T, oldValue: T | undefined) => MaybeDisposer,
  fireForCurrentValue?: boolean
)
export function onPropChange<T, K extends keyof T>(
  collection: T,
  prop: K,
  fn: (newValue: T[K], oldValue: T[K] | undefined) => MaybeDisposer,
  fireForCurrentValue?: boolean
)

// https://github.com/mobxjs/mobx/blob/36d3d35047c3002376fca676d79399f381af7319/packages/mobx/src/api/observe.ts#L63
export function onPropChange(thing, propOrFn, fnOrFire?, fireForCurrentValue?) {
  if (isFunction(propOrFn)) {
    return observeChange(thing, propOrFn, fnOrFire)
  } else {
    return observeChange(_getAdministration(thing, propOrFn), fnOrFire, fireForCurrentValue)
  }
}

function observeChange<T>(
  thing: any,
  fn: (newValue: T, oldValue: T | undefined) => MaybeDisposer,
  fireForCurrentValue: boolean = true
) {
  let disposer: MaybeDisposer

  const onObserve = (change) => {
    if (disposer) disposer()
    disposer = fn(change.newValue, change.oldValue)
  }

  const stopObserve = thing.observe_(onObserve, fireForCurrentValue)
  // const stopObserve = thing.intercept_(onObserve, fireForCurrentValue) //for intercepts

  return () => {
    if (disposer) disposer()
    stopObserve()
  }
}
