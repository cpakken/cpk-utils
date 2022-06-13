import { expect, test } from 'vitest'
import { lazy } from './lazy'

test('lazy decorator', () => {
  class TestClass {
    lazyCount = 0
    normalCount = 0

    @lazy get lazy() {
      return { count: ++this.lazyCount }
    }

    get normal() {
      return { count: ++this.normalCount }
    }
  }

  const t = new TestClass()
  const t2 = new TestClass()

  expect(t.lazy.count).toBe(1)
  expect(t.lazy.count).toBe(1)
  expect(t.lazy.count).toBe(1)

  expect(t2.lazy.count).toBe(1)
  expect(t2.lazy.count).toBe(1)
  expect(t2.lazy.count).toBe(1)

  expect(t.lazy === t.lazy).toBe(true)
  expect(t.lazy === t2.lazy).toBe(false)

  expect(t.normal.count).toBe(1)
  expect(t.normal.count).toBe(2)
  expect(t.normal.count).toBe(3)
})
