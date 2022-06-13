export function mapValues<T extends {}, R>(obj: T, fn: (value: T[keyof T], key: keyof T) => R) {
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
