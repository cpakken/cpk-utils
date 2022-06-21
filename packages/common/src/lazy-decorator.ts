type InstanceCache = WeakMap<object, any>
const lazyMemoMap = new WeakMap<() => any, InstanceCache>()

function _createLazy<T>(fn: () => T): () => T {
  const instanceCache: InstanceCache = new WeakMap()

  function lazyFn(this: object) {
    if (instanceCache.has(this)) {
      return instanceCache.get(this)
    } else {
      const result = fn.apply(this)
      instanceCache.set(this, result)
      return result
    }
  }

  lazyMemoMap.set(lazyFn, instanceCache)
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
