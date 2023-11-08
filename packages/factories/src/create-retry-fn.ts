export function createRetryFn<ARGS extends any[], R>(
  fn: (...args: ARGS) => R,
  options: { maxRetries?: number; delay?: number; check?: (result: any) => boolean } = {
    maxRetries: 10,
    delay: 60,
  }
) {
  const { maxRetries = 10, delay = 60, check } = options

  return async (...args: ARGS): Promise<R> => {
    //Use for loop, retry if check returns false
    for (let i = 0; i < maxRetries; i++) {
      const result = await fn(...args)
      if (!check || check(result)) return result
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
    throw new Error('Max retries exceeded')
  }
}
