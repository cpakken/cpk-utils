type DBCall = { fn: Function; args: any[]; priority: number; delay?: number }
export type DebouncedQueue = DBCall[]

export type Debouncer = {
  <T extends Function>(fn: T, options?: DebounceOptions): T
  /** cancel debounce call, and remove queue */
  flush: () => void
  /** call queue functions immediately instead of waiting for debounce */
  call: () => void
  /** enqueued debounced calls */
  readonly queue: DebouncedQueue
}

export type DebounceOptions = {
  priority?: number
  delay?: number
}

export function createBatchDebouncer(
  defaultDelay: number = 20,
  wrapperFn?: (queueCaller: () => void) => (queue: DebouncedQueue, maxDelay: number) => void,
): Debouncer {
  let timeout: number | null = null
  let queue: DebouncedQueue = []

  const queueCaller = () => {
    return queue.sort((a, b) => b.priority - a.priority).forEach(({ fn, args }) => fn(...args))
  }
  const callQueueWrapped = wrapperFn?.(queueCaller)

  const debounced = (dbCall: DBCall) => {
    queue.push(dbCall)
    const maxDelay = Math.max(...queue.map(({ delay }) => delay ?? defaultDelay))

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      // console.log('debounced', maxDelay, queue)
      callQueueWrapped ? callQueueWrapped(queue, maxDelay) : queueCaller()
      queue = []
    }, maxDelay) as any
  }

  const debouncer = <T extends Function>(fn: T, { priority = 0, delay }: DebounceOptions = {}): T => {
    return ((...args: any[]) => {
      debounced({ fn, args, priority, delay })
    }) as any
  }

  debouncer.flush = () => {
    if (timeout) clearTimeout(timeout)
    queue = []
  }

  debouncer.call = () => {
    if (timeout) clearTimeout(timeout)
    queueCaller()
    queue = []
  }

  return Object.defineProperty(debouncer, 'queue', { get: () => queue }) as Debouncer

  // return debouncer
}
