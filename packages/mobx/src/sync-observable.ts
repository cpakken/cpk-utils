import { comparer, createAtom, IAtom, runInAction } from 'mobx'

//Inspiration
// https://github.com/mobxjs/mobx-utils/blob/master/src/from-resource.ts

// -> solve untransactional computed
//https://github.com/mobxjs/mobx/issues/2795
//https://github.com/xaviergonz/mobx-keystone/issues/233

type Disposer = () => void
type MaybeDisposer = Disposer | void
export type ValueChangeHandler<T> = (value: T, oldValue: T | undefined) => MaybeDisposer

type SyncActive<T> = {
  atom: IAtom
  isInReaction: boolean
  unsubscribe: Disposer
  subscribers: Set<ValueChangeHandler<T>>
  // disposers: Array<Disposer>
  disposers: Map<ValueChangeHandler<T>, MaybeDisposer>
}

/**
 * Alternative to computed, features from from-resource but has observe api that can perform state changes in the same transaction
 * onInit is called lazily triggered when observed or in a reaction
 * will automatically unsubscribe when no longer in reaction and observed
 * PROS: turn O(n) to O(1) example...
 *  - can be observed and trigger state changes in the same transaction
 *  - lazily activates, only will be triggered when observed / in reaction and unsubscribes automatically when not in use
 * - all subscribers are run in a single transaction
 * CONS: use this being aware that this is an anti-pattern and goes against mobx philosophy
 * only use in low-level libraries or when you know what you are doing
 */
export class SyncObservable<S, V = S> {
  private active: SyncActive<V> | null = null

  private declare value: V
  private declare oldValue: V | undefined
  isDisposed: boolean = false

  peek() {
    return this.value
  }

  peekPrev() {
    return this.oldValue
  }

  constructor(
    private onInit: (sink: (value: S, reportChanged?: boolean) => void, dispose: Disposer) => Disposer,
    private reducer?: (accumulator: V, current: S) => V,
    private initialValue?: V
  ) {
    if (initialValue !== undefined) this.value = initialValue
  }

  private _next(nextValue: V, active: SyncActive<V> | null, reportChanged = true) {
    if (!comparer.default(nextValue, this.value)) {
      this.oldValue = this.value
      this.value = nextValue

      if (active) {
        //TODO runInAction probably is not needed... if true, remove
        runInAction(() => {
          if (reportChanged) active.atom.reportChanged()
          active.disposers.forEach((disposer) => disposer?.())

          active.disposers = new Map(
            Array.from(active.subscribers, (subscriber) => {
              return [subscriber, subscriber(this.value, this.oldValue)]
            })
          )
        })
      }
    }
  }

  private createActive(): SyncActive<V> {
    if (this.isDisposed) throw new Error('syncObservable has already been disposed')
    // if (this.active) throw new Error()
    if (this.active) return this.active

    const onChange = (next: S, reportChanged = true) => {
      const nextValue = (this.reducer ? this.reducer(this.value, next) : next) as V
      this._next(nextValue, active, reportChanged)
    }

    const onBecomeObserved = () => {
      active.isInReaction = true
    }
    const onBecomeUnobserved = () => {
      active.isInReaction = false
      if (active.subscribers.size === 0) {
        this.stop()
      }
    }

    const active: SyncActive<V> = {
      atom: createAtom('sync-observable', onBecomeObserved, onBecomeUnobserved),
      //@ts-ignore
      unsubscribe: undefined, //run onInit after active is initialized
      subscribers: new Set(),
      disposers: new Map(),
      isInReaction: false,
    }

    active.unsubscribe = this.onInit(onChange, this.dispose.bind(this))

    return active
  }

  get isActive() {
    return !!this.active
  }

  private stop(disposeSubscribers = true) {
    const { active } = this

    if (active) {
      runInAction(() => {
        if (disposeSubscribers) {
          active.disposers.forEach((disposer) => disposer?.())
        }
        active.unsubscribe()
      })

      if (active.isInReaction) console.warn('syncObservable.stop() called while in reaction')

      this.active = null
    }
  }

  subscribe(subscriber: ValueChangeHandler<V>, runImmediately = true): () => void {
    this.active ||= this.createActive()

    const { active } = this

    active.subscribers.add(subscriber)

    if (runImmediately) {
      const disposer = subscriber(this.value, this.oldValue)

      if (disposer) active.disposers.set(subscriber, disposer)
    }

    return (fireDisposer = true) => {
      if (fireDisposer) active.disposers.get(subscriber)?.()
      active.disposers.delete(subscriber)

      active.subscribers.delete(subscriber)

      if (active.subscribers.size === 0 && !active.isInReaction) {
        this.stop()
      }
    }
  }

  val() {
    if (this.active) {
      this.active.atom.reportObserved()
      return this.value
    } else {
      this.active = this.createActive()
      if (this.active.atom.reportObserved()) {
        return this.value
      } else {
        throw new Error(`syncObservable.val() called outside of reaction/observer`)
        //TODO just start active and stop immediately after returning, but onInit (sink) is not gauranteed to run immediately
      }
    }
  }

  /**
   * Avoid using, but can manually set (bypasses reducer)
   * @param val if undefined, will use initialValue if specified
   */
  reset(val?: V, reportChanged = true) {
    const nextValue = val ?? this.initialValue
    if (nextValue !== undefined) this._next(nextValue, this.active, reportChanged)
  }

  dispose() {
    this.stop()
    this.isDisposed = true
  }
}

export function syncObservable<S>(
  onInit: (sink: (value: S, reportChanged?: boolean) => void, dispose: Disposer) => Disposer
): SyncObservable<S>

export function syncObservable<S, V = S>(
  onInit: (sink: (value: S, reportChanged?: boolean) => void, dispose: Disposer) => Disposer,
  reducer: (accumulator: V, current: S) => V,
  initialValue?: V
): SyncObservable<S, V>

export function syncObservable<S, V>(
  onInit: (sink: (value: S, reportChanged?: boolean) => void, dispose: Disposer) => Disposer,
  reducer?: (accumulator: V, current: S) => V,
  initialValue?: V
): SyncObservable<S, V> {
  return new SyncObservable(onInit, reducer, initialValue)
}
