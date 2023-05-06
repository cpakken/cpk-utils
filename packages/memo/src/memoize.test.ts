import { expect, test, vi } from 'vitest'
import { clearMemoize, memoize } from './memoize'

test('memoize one argument', () => {
  const mock = vi.fn((val: number) => val + 3)
  const add3 = memoize(mock)

  expect(add3(2)).toEqual(5)
  add3(2)
  add3(2)
  add3(2)

  expect(mock).toBeCalledTimes(1)

  clearMemoize(add3, 2)
  add3(2)
  expect(mock).toBeCalledTimes(2)

  clearMemoize(add3)
  add3(2)
  expect(mock).toBeCalledTimes(3)
})
