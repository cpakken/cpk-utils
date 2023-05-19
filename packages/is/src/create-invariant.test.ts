import { invariant } from './create-invariant'

describe('invariant', () => {
  test('type assert', () => {
    const a = 1 as number | undefined
    expectTypeOf(a).toMatchTypeOf<number | undefined>()
    invariant(a !== undefined, 'a is undefined')
    expectTypeOf(a).toMatchTypeOf<number>()
  })
  test('throws', () => {
    const a = undefined as number | undefined
    expect(() => invariant(a !== undefined, 'a is undefined')).toThrow()
  })
})
