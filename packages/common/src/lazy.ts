type InstanceMap = WeakMap<object, any>
const lazyMemoMap = new WeakMap<() => any, InstanceMap>()

function _createLazy<T>(fn: () => T): () => T {
  const instanceMap: InstanceMap = new WeakMap()

  function lazyFn() {
    const cache = instanceMap.get(this)
    if (cache === undefined) {
      const result = fn.apply(this)
      instanceMap.set(this, result)
      return result
    } else {
      return cache
    }
  }

  lazyMemoMap.set(lazyFn, instanceMap)
  return lazyFn
}

export function lazy(_target: any, _key: string, descriptor: PropertyDescriptor) {
  if (descriptor.get) {
    const func = descriptor.get
    descriptor.get = _createLazy(func)
  }
}

export function resetLazy<T extends object>(instance: T, propKey: keyof T) {
  const getter = Object.getOwnPropertyDescriptor((instance as any).__proto__, propKey)?.get
  if (getter) {
    const cache = lazyMemoMap.get(getter)
    if (cache) return cache.delete(instance)
  }

  throw new Error(`No lazy property ${propKey.toString()} on ${instance}`)
}
