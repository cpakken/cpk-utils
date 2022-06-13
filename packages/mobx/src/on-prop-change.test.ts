import { observable } from 'mobx'
import { expect, test, vi } from 'vitest'
import { onPropChange } from './on-prop-change'

test('observable', () => {
  const o = observable.box(1)
  const fn = vi.fn()

  onPropChange(o, (newValue, oldValue) => {
    fn(newValue, oldValue)
  })

  o.set(2)
  expect(fn.mock.calls).toEqual([
    [1, undefined],
    [2, 1],
  ])
})

test('prop', () => {
  const o = observable({ a: 1 })
  const fn = vi.fn()

  onPropChange(o, 'a', (newValue, oldValue) => {
    fn(newValue, oldValue)
  })

  o.a = 2
  expect(fn.mock.calls).toEqual([
    [1, undefined],
    [2, 1],
  ])
})
