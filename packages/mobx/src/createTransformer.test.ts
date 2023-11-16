import { observable, autorun, runInAction, configure } from 'mobx'
import { createTransformer } from './createTransformer'

configure({ disableErrorBoundaries: true })

describe('createTransformer', () => {
  test('caches values', () => {
    const a = observable({ val: 1 })
    const mockFn = vi.fn((obj: { val: number }) => obj.val * 2)
    const transform = createTransformer(mockFn)

    autorun(() => {
      transform(a)
      transform(a)
      transform(a)
    })

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith({ val: 1 })
  })

  test('caches values', () => {
    const a = observable({ val: 1 })
    const mockFn = vi.fn((obj: { val: number }) => obj.val * 2)
    const transform = createTransformer(mockFn)

    autorun(() => {
      transform(a)
      transform(a)
      transform(a)
    })

    runInAction(() => {
      a.val = 2
    })

    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toReturnWith(2)
    expect(mockFn).toReturnWith(4)
  })
})
