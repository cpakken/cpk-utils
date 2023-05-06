import { reaction } from 'mobx'
import { MaybeDisposer } from './types'

export interface IOnValidOptions {
  // name?: string
  timeout?: number
  onError?: (error: any) => void
}

export function onValid<T>(fn: () => T): NonNullable<T> | PromiseLike<NonNullable<T>>
export function onValid<T>(fn: () => T, effect: (result: NonNullable<T>) => void): MaybeDisposer
export function onValid<T>(
  fn: () => T,
  effect?: (result: NonNullable<T>) => void
): MaybeDisposer | NonNullable<T> | PromiseLike<NonNullable<T>> {
  //Used to check if result is resolved synchronously
  let validResult: T | null = null

  //Promise handling
  let resolve: ((result: NonNullable<T>) => void) | null = null
  let reject: ((error: any) => void) | null = null

  const dispose = reaction(
    fn,
    (result, _prev, { dispose }) => {
      if (result) {
        dispose()
        effect?.(result)
        resolve?.(result)
        validResult = result
      }
    },
    {
      fireImmediately: true,
      onError: (error) => {
        dispose()
        reject?.(error)
      },
    }
  )

  if (effect) {
    if (!validResult) return dispose
  } else {
    if (validResult) return validResult
    //Return promise
    return new Promise((res, rej) => {
      resolve = res
      reject = rej
    })
  }
}
