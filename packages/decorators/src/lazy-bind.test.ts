import { expect, test } from 'vitest'
import { lazyBind } from './lazy-bind'

test('lazy bind decorator', () => {
  const wrapCall = vi.fn()

  function wrapper<FN extends Function>(fn: FN): FN {
    return function (this: any, ...args: any[]) {
      wrapCall()
      return fn.apply(this, args)
    } as any
  }

  class TestClass {
    count = 0

    @lazyBind
    lazy() {
      this.count++
    }

    @lazyBind(wrapper)
    lazyWrapped() {
      this.count++
    }

    unBinded() {
      this.count++
    }
  }

  const t = new TestClass()
  const { lazy, unBinded, lazyWrapped } = t

  expect(lazy).toBe(t.lazy)

  expect(t.count).toBe(0)
  lazy()
  expect(t.count).toBe(1)

  lazyWrapped()
  expect(t.count).toBe(2)
  expect(wrapCall).toBeCalledTimes(1)

  expect(unBinded).toThrow()
})
