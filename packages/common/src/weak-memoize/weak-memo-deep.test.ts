import { describe, expect, test, vi } from 'vitest'
import { isWeakMemoDeepFn, weakMemoDeep } from './weak-memo-deep'

describe('weak-memoize-recursive', () => {
  test('basic', () => {
    const fn = vi.fn()

    const _memoized = weakMemoDeep(fn)
    const memoized = vi.fn(_memoized)

    expect(isWeakMemoDeepFn(_memoized)).toBe(true)
    expect(isWeakMemoDeepFn(fn)).toBe(false)

    //Primative arguments are not memoized
    memoized(1, 2, 3)
    memoized(1, 2, 3)
    memoized(1, 2, 3)

    const { a, b, c } = { a: { val: 'a' }, b: { val: 'b' }, c: { val: 'c' } }

    memoized(a)
    memoized(a)
    memoized(a)

    memoized(a, b)
    memoized(a, b)
    memoized(a, b)

    memoized(a)
    memoized(a)
    memoized(a)

    memoized(b)
    memoized(b)
    memoized(b)

    memoized(c, a)
    memoized(c, a)
    memoized(c, a)

    memoized(a, b, c)
    memoized(a, b, c)
    memoized(a, b, c)

    //original fn is called once per unique non-primative argument
    expect(fn.mock.calls).toEqual([
      [1, 2, 3],
      [1, 2, 3],
      [1, 2, 3],
      [{ val: 'a' }],
      [{ val: 'a' }, { val: 'b' }],
      [{ val: 'b' }],
      [{ val: 'c' }, { val: 'a' }],
      [{ val: 'a' }, { val: 'b' }, { val: 'c' }],
    ])

    //memoized returns cached results as expected
    expect(memoized.mock.calls).toEqual([
      [1, 2, 3],
      [1, 2, 3],
      [1, 2, 3],
      [{ val: 'a' }],
      [{ val: 'a' }],
      [{ val: 'a' }],
      [{ val: 'a' }, { val: 'b' }],
      [{ val: 'a' }, { val: 'b' }],
      [{ val: 'a' }, { val: 'b' }],
      [{ val: 'a' }],
      [{ val: 'a' }],
      [{ val: 'a' }],
      [{ val: 'b' }],
      [{ val: 'b' }],
      [{ val: 'b' }],
      [{ val: 'c' }, { val: 'a' }],
      [{ val: 'c' }, { val: 'a' }],
      [{ val: 'c' }, { val: 'a' }],
      [{ val: 'a' }, { val: 'b' }, { val: 'c' }],
      [{ val: 'a' }, { val: 'b' }, { val: 'c' }],
      [{ val: 'a' }, { val: 'b' }, { val: 'c' }],
    ])
  })
})
