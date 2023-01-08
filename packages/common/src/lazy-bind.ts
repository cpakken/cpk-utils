type InstanceCache = WeakMap<object, any>

const lazyBindMap = new WeakMap<() => any, InstanceCache>()

function createLazyBind<T>(fn: () => T): () => T {
  const instanceCache: InstanceCache = new WeakMap()

  function lazyGetter(this: object) {
    if (instanceCache.has(this)) {
      return instanceCache.get(this)
    } else {
      const binded = fn.bind(this)
      instanceCache.set(this, binded)
      return binded
    }
  }

  lazyBindMap.set(lazyGetter, instanceCache)
  return lazyGetter
}

export function lazyBind(
  wrapperFn: <T extends Function>(fn: T) => T
): ReturnType<typeof createLazyBindDecortor>
export function lazyBind(_target: any, _key: string, descriptor: PropertyDescriptor): void
export function lazyBind(wrapperFnOrTarget: any, _key?: string, descriptor?: PropertyDescriptor) {
  // rome-ignore lint/style/noArguments: <explanation>
  if (arguments.length === 1) {
    return createLazyBindDecortor(wrapperFnOrTarget)
  } else return createLazyBindDecortor()(wrapperFnOrTarget, _key!, descriptor!)
}

function createLazyBindDecortor(wrapperFn?: <T extends Function>(fn: T) => T) {
  return (_target: any, _key: string, descriptor: PropertyDescriptor) => {
    if (descriptor.value) {
      const classFunction = descriptor.value

      // rome-ignore lint/performance/noDelete: Decorator Hack
      delete descriptor.value
      // rome-ignore lint/performance/noDelete: Decorator Hack
      delete descriptor.writable

      descriptor.configurable = false
      descriptor.get = createLazyBind(wrapperFn ? wrapperFn(classFunction) : classFunction)
    }
  }
}

export function resetLazyBind<T extends object>(instance: T, propKey: keyof T) {
  const getter = Object.getOwnPropertyDescriptor((instance as any).__proto__, propKey)?.get
  if (getter) {
    const cache = lazyBindMap.get(getter)
    if (cache) return cache.delete(instance)
  }

  throw new Error(`No lazy property ${propKey.toString()} on ${instance}`)
}
