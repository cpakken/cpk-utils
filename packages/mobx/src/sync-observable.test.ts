import { autorun, observable, observe, runInAction } from 'mobx'
import { syncObservable } from './sync-observable'

describe('syncObservable', () => {
  test('kitchen sink', () => {
    const a = observable({ val: 1 })

    const dispose = vi.fn()
    const syncHandler = (sink) => {
      const stop = observe(a, 'val', ({ newValue }) => sink(newValue), true)

      return () => {
        dispose()
        stop()
      }
    }

    const reducer = (current, next) => next + current

    const syncObs = syncObservable<number>(syncHandler, reducer, 0)

    expect(syncObs.isActive).toBe(false)
    expect(syncObs.peek()).toBe(0)
    expect(syncObs.peekPrev()).toBe(undefined)

    const record = vi.fn()
    const autorunDisposer = autorun(() => {
      const aval = a.val
      const sval = syncObs.val()
      record({ aval, sval })
    })

    const onlySyncAutorunFn = vi.fn()
    const autorunOnlySyncDisposer = autorun(() => onlySyncAutorunFn(syncObs.val()))

    expect(syncObs.isActive).toBe(true)

    runInAction(() => (a.val = 2))

    const observeFn = vi.fn()
    const disposeSyncObserve = syncObs.subscribe((val, old) => {
      observeFn(val, old)
      return () => observeFn('disposed')
    })

    runInAction(() => (a.val = 3))
    runInAction(() => (a.val = 4))

    runInAction(() => {
      a.val = 5
      a.val = 6
      a.val = 7
    })

    expect(dispose).toBeCalledTimes(0)
    disposeSyncObserve()
    expect(dispose).toBeCalledTimes(0)
    autorunDisposer()
    autorunOnlySyncDisposer()
    expect(dispose).toBeCalledTimes(1)

    runInAction(() => (a.val = 3))
    runInAction(() => (a.val = 4))

    expect(syncObs.isActive).toBe(false)

    expect(record.mock.calls.flat()).toEqual([
      { aval: 1, sval: 1 },
      { aval: 2, sval: 3 },
      { aval: 3, sval: 6 },
      { aval: 4, sval: 10 },
      { aval: 7, sval: 28 },
    ])

    expect(onlySyncAutorunFn.mock.calls.flat()).toEqual([1, 3, 6, 10, 28])

    expect(observeFn.mock.calls).toEqual([
      [3, 1],
      ['disposed'],
      [6, 3],
      ['disposed'],
      [10, 6],
      ['disposed'],
      [15, 10],
      ['disposed'],
      [21, 15],
      ['disposed'],
      [28, 21],
      ['disposed'],
    ])
  })

  test('requiresReaction ', () => {
    const sync = syncObservable((sink) => (sink(1), () => {}))
    const syncRequiresNoReaction = syncObservable((sink) => (sink(1), () => {}), { requiresReaction: false })

    expect(sync.isActive).toBe(false)
    expect(() => sync.val()).toThrowErrorMatchingInlineSnapshot(
      '"mobx-utils/syncObservable: REQUIRES REACTION: val() called outside of reaction/observer"'
    )
    expect(sync.isActive).toBe(false)

    expect(syncRequiresNoReaction.val()).toBe(1)
  })
})
