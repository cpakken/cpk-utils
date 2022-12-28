import { flatIter, flatMapIter } from './collection-fns'

test('flatMapIter', () => {
  const a = new Set([1, 2, 3])
  const b = new Set([4, 5, 6])

  const result = flatMapIter([a, b, 8], (x) => x * 2)

  expect([...result]).toEqual([2, 4, 6, 8, 10, 12, 16])
})

test('combine iter', () => {
  const combined = flatIter([1, 2, 3], [4, 5, 6], 7, 8, 9)
  expect([...combined]).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
})
