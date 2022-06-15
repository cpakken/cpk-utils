import { action } from 'mobx'

/**
 * Same as action, but does not require makeObservable(target) to work
 */
export function actionx(_target: any, _key: string, descriptor: PropertyDescriptor) {
  if (descriptor.value) {
    const func = descriptor.value
    descriptor.value = action(func)
  }
}
