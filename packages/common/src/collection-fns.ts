export function mapValues<T extends {}, R>(
  obj: T,
  fn: (value: T[keyof T & string], key: keyof T & string) => R
) {
  const result = {} as Record<keyof T, R>
  for (const key in obj) {
    result[key] = fn(obj[key], key)
  }
  return result
}

export function forEach<T extends {}, R>(obj: T, fn: (value: T[keyof T], key: keyof T) => R) {
  for (const key in obj) {
    fn(obj[key], key)
  }
}

export function* mapIter<T, R>(collection: Iterable<T>, fn: (item: T) => R): IterableIterator<R> {
  for (const item of collection) {
    yield fn(item)
  }
}

export function isIter<T>(thing: T): thing is T extends Iterable<any> ? T : never {
  return typeof thing[Symbol.iterator] === 'function'
}

type UnwrapIter<T> = T extends Iterable<infer U> ? U : T

export function* flatIter<T>(
  ...collection: (T | Iterable<T | Iterable<T>>)[]
): IterableIterator<UnwrapIter<T>> {
  //Do recursive flatten
  for (const item of collection) {
    if (isIter(item)) {
      yield* flatIter(...(item as any))
    } else {
      yield item as any
    }
  }
}

export function* flatMapIter<T, R>(
  collection: Iterable<T | Iterable<T>>,
  fn: (item: UnwrapIter<T>) => R
): IterableIterator<R> {
  for (const item of collection) {
    if (isIter(item)) {
      yield* flatMapIter(item as any, fn)
    } else {
      yield fn(item as any)
    }
  }
}

//same as mapIter but don't yield with result is undefined or null
export function* mapfilterIter<T, R>(
  collection: Iterable<T>,
  fn: (item: T) => R | undefined | null
): IterableIterator<R> {
  for (const item of collection) {
    const result = fn(item)
    if (result !== undefined && result !== null) yield result
  }
}

export function reduceIter<T, R>(collection: Iterable<T>, fn: (acc: R, item: T) => R, initialValue: R) {
  let acc = initialValue
  for (const item of collection) {
    acc = fn(acc, item)
  }
  return acc
}

export function isTruthy<T>(collection: Iterable<T>, fn: (item: T) => any): boolean {
  for (const item of collection) {
    if (!fn(item)) return false
  }
  return true
}
