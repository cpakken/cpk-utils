import { hashInt, intHash } from './hash-int'

test('hashInt', () => {
  expect(hashInt(1)).toBe('1')
  expect(hashInt(10)).toBe('a')

  expect(hashInt(0)).toBe('0')
  expect(hashInt(61)).toBe('Z')
  expect(hashInt(62)).toBe('10')

  const tests = [0, 1, 234534, 342324, 1231424, 675343]
  for (const test of tests) {
    expect(intHash(hashInt(test))).toBe(test)
  }
})
