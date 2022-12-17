import { action, observable, when } from 'mobx'

export type ObservableRecorder<T = any> = ((item: T) => T) & {
  show: () => T[]
  reset: () => void
  waitUntil: (predicate: (last: T, list: T[]) => any) => Promise<T[]>
}

export function createObsRecorder<T = any>(): ObservableRecorder<T> {
  const list = observable.array<T>([], { deep: false })

  const waitUntil = async (predicate: (last: T, list: T[]) => any) => {
    await when(() => Boolean(predicate(list.at(-1)!, list)))
    return [...list]
  }

  const recorder = action((item: T) => {
    list.push(item)
    return item
  })

  return Object.assign(recorder, {
    show: () => [...list],
    reset: () => list.clear(),
    waitUntil,
  })
}
