import { autorun, observable, runInAction } from 'mobx'
import { expect, test, vi } from 'vitest'
import { actionx } from './actionx'

test('actionx', () => {
  const warnSpy = vi.spyOn(console, 'warn')

  class A {
    list = observable([1, 2, 3])

    @actionx push(item) {
      // push(item) {
      return this.list.push(item)
    }
  }

  const a = new A()

  autorun(() => [...a.list])

  runInAction(() => a.push(4))
  a.push(5)
  expect(warnSpy).toBeCalledTimes(0)
})
