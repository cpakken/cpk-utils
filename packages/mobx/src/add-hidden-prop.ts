export function addHiddenProp<T>(instance: T, prop: string | symbol, value: any): T {
  Object.defineProperty(instance, prop, {
    enumerable: false,
    // configurable: true,
    // writable: true,
    value,
  })
  return instance
}
