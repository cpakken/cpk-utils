import { IObservableArray, observable, ObservableSet } from 'mobx'
import { observeCollection } from './observe-collection'

describe('observeCollection', () => {
  const record = vi.fn()
  const observe = (collection, fireForCurrentChildren) =>
    observeCollection(
      collection,
      {
        onAttach: (child, index, prev) => {
          record('attach', { index, child, prev })
          return () => record('dispose', { index, child })
        },
        onDetach: (child, index) => record('detach', { child, index }),
        onIndex: (child, newIndex, oldIndex) => record('index', { newIndex, oldIndex, child }),
      },
      fireForCurrentChildren
    )

  beforeEach(() => {
    record.mockClear()
  })

  describe('set', () => {
    let m: ObservableSet<string>

    beforeEach(() => {
      m = observable.set(['a', 'b', 'c', 'd'])
    })

    test('fireImmediately', () => {
      observe(m, true)
      expect(record.mock.calls).toEqual([
        ['attach', { index: 'a', child: 'a', prev: undefined }],
        ['attach', { index: 'b', child: 'b', prev: undefined }],
        ['attach', { index: 'c', child: 'c', prev: undefined }],
        ['attach', { index: 'd', child: 'd', prev: undefined }],
      ])
    })

    test('add/remove', () => {
      observe(m, true)
      record.mockClear()
      m.add('e')
      m.delete('b')

      expect(record.mock.calls).toEqual([
        ['attach', { index: 'e', child: 'e', prev: undefined }],
        ['dispose', { index: 'b', child: 'b' }],
        ['detach', { child: 'b', index: 'b' }],
      ])
    })
  })

  describe('array', () => {
    let m: IObservableArray<string>

    beforeEach(() => {
      m = observable.array(['a', 'b', 'c', 'd'])
    })

    test('fireImmediately', () => {
      observe(m, true)
      expect(record.mock.calls).toEqual([
        ['attach', { index: 0, child: 'a', prev: undefined }],
        ['attach', { index: 1, child: 'b', prev: undefined }],
        ['attach', { index: 2, child: 'c', prev: undefined }],
        ['attach', { index: 3, child: 'd', prev: undefined }],
      ])
    })

    test('add/update', () => {
      observe(m, false)
      m.push('foobar')
      m[1] = 'baz'

      expect(record.mock.calls).toEqual([
        ['attach', { index: 4, child: 'foobar', prev: undefined }],
        ['attach', { index: 1, child: 'baz', prev: 'b' }],
      ])

      expect(m).toEqual(['a', 'baz', 'c', 'd', 'foobar'])
    })

    test('remove', () => {
      observe(m, false)
      m.pop()
      m.shift()

      expect(record.mock.calls).toEqual([
        ['detach', { child: 'd', index: 3 }],
        ['index', { newIndex: 0, oldIndex: 1, child: 'b' }],
        ['index', { newIndex: 1, oldIndex: 2, child: 'c' }],
        ['detach', { child: 'a', index: 0 }],
      ])

      expect(m).toEqual(['b', 'c'])
    })

    test('splice delete 2 insert 2', () => {
      observe(m, false)
      m.splice(1, 2, 'x', 'y')

      expect(record.mock.calls).toEqual([
        ['detach', { child: 'b', index: 1 }],
        ['detach', { child: 'c', index: 2 }],
        ['attach', { index: 1, child: 'x', prev: undefined }],
        ['attach', { index: 2, child: 'y', prev: undefined }],
      ])

      expect(m).toEqual(['a', 'x', 'y', 'd'])
    })

    test('splice insert 2', () => {
      observe(m, false)
      m.splice(1, 0, 'x', 'y')

      expect(record.mock.calls).toEqual([
        ['index', { newIndex: 3, oldIndex: 1, child: 'b' }],
        ['index', { newIndex: 4, oldIndex: 2, child: 'c' }],
        ['index', { newIndex: 5, oldIndex: 3, child: 'd' }],
        ['attach', { index: 1, child: 'x', prev: undefined }],
        ['attach', { index: 2, child: 'y', prev: undefined }],
      ])

      expect(m).toEqual(['a', 'x', 'y', 'b', 'c', 'd'])
    })

    test('splice delete 2', () => {
      observe(m, false)
      m.splice(1, 2)

      expect(record.mock.calls).toEqual([
        ['index', { newIndex: 1, oldIndex: 3, child: 'd' }],
        ['detach', { child: 'b', index: 1 }],
        ['detach', { child: 'c', index: 2 }],
      ])

      expect(m).toEqual(['a', 'd'])
    })

    test('splice delete 2 add 1', () => {
      observe(m, false)
      m.splice(1, 2, 'x')

      expect(record.mock.calls).toEqual([
        ['index', { newIndex: 2, oldIndex: 3, child: 'd' }],
        ['detach', { child: 'b', index: 1 }],
        ['detach', { child: 'c', index: 2 }],
        ['attach', { index: 1, child: 'x', prev: undefined }],
      ])

      expect(m).toEqual(['a', 'x', 'd'])
    })

    test('splice delete 1 add 2', () => {
      observe(m, false)
      m.splice(1, 1, 'x', 'y')

      expect(record.mock.calls).toEqual([
        ['index', { newIndex: 3, oldIndex: 2, child: 'c' }],
        ['index', { newIndex: 4, oldIndex: 3, child: 'd' }],
        ['detach', { child: 'b', index: 1 }],
        ['attach', { index: 1, child: 'x', prev: undefined }],
        ['attach', { index: 2, child: 'y', prev: undefined }],
      ])

      expect(m).toEqual(['a', 'x', 'y', 'c', 'd'])
    })
  })
})
