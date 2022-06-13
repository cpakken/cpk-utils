function _createLazy<T>(fn: () => T): () => T {
  const memoMap = new WeakMap()

  return function lazyFn() {
    const cache = memoMap.get(this)
    if (cache === undefined) {
      const result = fn.apply(this)
      memoMap.set(this, result)
      return result
    } else {
      return cache
    }
  }
}

export function lazy(_target: any, _key: string, descriptor: PropertyDescriptor) {
  if (descriptor.get) {
    const func = descriptor.get
    descriptor.get = _createLazy(func)
  }
}
