import { expect, test, vi } from 'vitest'
import { clearWeakMemo, weakMemo } from './weak-memoize'

test('memoize no arguments', () => {
  const mock = vi.fn()
  const fn = () => {
    mock()
    return { val: 'no arguments' }
  }
  const memo = weakMemo(fn)
  memo()
  memo()
  memo()

  expect(mock).toBeCalledTimes(1)
  expect(memo()).toBe(memo())
})

test('memoize one argument', () => {
  const mock = vi.fn((obj: { val: number }) => ({ val: obj.val + 3 }))
  const add3 = weakMemo(mock)

  const obj = { val: 1 }

  expect(add3(obj)).toEqual({ val: 4 })
  add3(obj)
  add3(obj)
  add3(obj)

  expect(mock).toBeCalledTimes(1)

  clearWeakMemo(add3, obj)
  add3(obj)
  expect(mock).toBeCalledTimes(2)

  clearWeakMemo(add3)
  add3(obj)
  expect(mock).toBeCalledTimes(3)
})
