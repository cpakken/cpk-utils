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

test('memoize one argument', () => {
  const add3 = vi.fn((obj: { val: number }) => ({ val: obj.val + 3 }))
  const add3memoed = weakMemo(add3)

  const obj = { val: 1 }

  expect(add3memoed(obj)).toEqual({ val: 4 })
  add3memoed(obj)
  add3memoed(obj)
  add3memoed(obj)

  expect(add3).toBeCalledTimes(1)

  add3memoed.clear(obj)
  add3memoed(obj)
  expect(add3).toBeCalledTimes(2)

  add3memoed.reset()
  add3memoed(obj)
  expect(add3).toBeCalledTimes(3)

  const peeked = add3memoed.peek({ val: 2 })
  expect(peeked).toEqual(undefined)
  expect(add3).toBeCalledTimes(3)
})

test('preserve types', () => {
  function buffer<T extends { id: any }>(FOO: T): T {
    return FOO
  }

  const memoedBuffer = weakMemo(buffer)
  const obj = memoedBuffer<{ id: string }>({ id: '1' })
})
