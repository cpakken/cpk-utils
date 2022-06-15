import { autorun } from 'mobx'

export type TAutoRunTest = ((fn: () => void) => void) & { dispose: () => void }

export function createAutorunTest() {
  let disposer: (() => void)[] = []

  const a = (fn: () => void) => {
    return disposer.push(autorun(fn))
  }

  return Object.assign(a, {
    dispose: () => {
      disposer.forEach((d) => d())
      disposer = []
    },
  })
}
