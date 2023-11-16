/**
 * A utility class for managing a set of handlers of a specific type.
 * @template HANDLER The type of the handlers.
 */
export class Handlers<HANDLER extends (...args: any[]) => any> {
  /**
   * The set of handlers.
   * @private
   */
  private handlers = new Set<HANDLER>()

  /**
   * Adds a handler to the set of handlers.
   * @param handler The handler to add.
   * @returns A function that removes the handler from the set of handlers.
   */
  add(handler: HANDLER) {
    this.handlers.add(handler)
    return () => this.handlers.delete(handler)
  }

  /**
   * Triggers all handlers in the set with the given arguments.
   * @param args The arguments to pass to the handlers.
   * @returns An array of the return values of the handlers.
   */
  trigger(...args: Parameters<HANDLER>): ReturnType<HANDLER>[] {
    const results: ReturnType<HANDLER>[] = []
    this.handlers.forEach((handler) => {
      results.push(handler(...args))
    })
    return results
  }

  /**
   * Clears the set of handlers.
   */
  clear() {
    this.handlers.clear()
  }

  // disposeAll(...args: Parameters<HANDLER>): ReturnType<HANDLER>[] {
  //   const results = this.trigger(...args)
  //   this.clear()
  //   return results
  // }
}

export function createHandlers<HANDLER extends (...args: any[]) => any>() {
  return new Handlers<HANDLER>()
}

/**
 * A class that manages a collection of handlers associated with keys.
 * @template KEY The type of the keys.
 * @template HANDLER The type of the handlers.
 */
export class KeyedHandlers<KEY, HANDLER extends (...args: any[]) => any> {
  /**
   * A map that stores the handlers associated with keys.
   */
  private handlers = new Map<KEY, HANDLER>()

  add(key: KEY, handler: HANDLER) {
    if (this.handlers.has(key)) {
      throw new Error(`Handler for key ${key} already exists.`)
    }
    this.handlers.set(key, handler)
    return () => this.handlers.delete(key)
  }

  trigger(key: KEY, ...args: Parameters<HANDLER>): ReturnType<HANDLER> {
    const handler = this.handlers.get(key)
    if (!handler) throw new Error(`Handler for key ${key} does not exist.`)
    return handler(...args)
  }

  triggerAll(...args: Parameters<HANDLER>): ReturnType<HANDLER>[] {
    const results: ReturnType<HANDLER>[] = []
    for (const handler of this.handlers.values()) {
      results.push(handler(...args))
    }
    return results
  }

  remove(key: KEY) {
    if (!this.handlers.has(key)) {
      throw new Error(`Handler for key ${key} does not exist.`)
    }
    this.handlers.delete(key)
  }

  dispose(key: KEY, ...args: Parameters<HANDLER>): ReturnType<HANDLER> {
    const result = this.trigger(key, ...args)
    this.remove(key)
    return result
  }

  disposeAll(...args: Parameters<HANDLER>): ReturnType<HANDLER>[] {
    const results: ReturnType<HANDLER>[] = []
    for (const [key, handler] of this.handlers.entries()) {
      results.push(handler(...args))
      this.handlers.delete(key)
    }
    return results
  }

  clear() {
    this.handlers.clear()
  }
}

export function createKeyedHandlers<KEY, HANDLER extends (...args: any[]) => any>() {
  return new KeyedHandlers<KEY, HANDLER>()
}
