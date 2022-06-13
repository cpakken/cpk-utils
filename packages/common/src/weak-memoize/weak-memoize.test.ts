import { expect, test, vi } from 'vitest'
import { weakMemo } from './weak-memoize'

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
