import { Handlers } from './create-handler'

describe('Handlers', () => {
  test('add and trigger', () => {
    const handlers = new Handlers<(a: number, b: number) => number>()

    const fn1 = vi.fn((a, b) => a + b)
    const fn2 = vi.fn((a, b) => a * b)

    handlers.add(fn1)
    handlers.add(fn2)

    expect(handlers.trigger(2, 3)).toEqual([5, 6])
    expect(fn1).toHaveBeenCalledWith(2, 3)
    expect(fn2).toHaveBeenCalledWith(2, 3)
  })

  test('remove', () => {
    const handlers = new Handlers<() => void>()

    const fn1 = vi.fn()
    const fn2 = vi.fn()

    const remove1 = handlers.add(fn1)
    handlers.add(fn2)

    remove1()

    handlers.trigger()

    expect(fn1).not.toHaveBeenCalled()
    expect(fn2).toHaveBeenCalled()
  })

  test('clear', () => {
    const handlers = new Handlers<() => void>()

    const fn1 = vi.fn()
    const fn2 = vi.fn()

    handlers.add(fn1)
    handlers.add(fn2)

    handlers.clear()

    handlers.trigger()

    expect(fn1).not.toHaveBeenCalled()
    expect(fn2).not.toHaveBeenCalled()
  })
})
