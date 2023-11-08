export type DebouncedFn<FN extends (...args: any[]) => void> = FN & {
  cancel: () => void
  now: FN
}

export function debounce<FN extends (...args: any[]) => void>(fn: FN, delay: number = 0): DebouncedFn<FN> {
  let timeout: ReturnType<typeof setTimeout> | null = null

  function debounced(this: any, ...args: any[]) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      timeout = null
      fn.apply(this, args)
    }, delay)
  }

  return Object.assign(debounced, {
    cancel: () => timeout && clearTimeout(timeout),
    now: (...arg: any[]) => {
      timeout && clearTimeout(timeout)
      fn(...arg)
    },
  }) as any
}
