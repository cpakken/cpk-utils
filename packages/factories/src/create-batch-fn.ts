/**
 *
 * @param fn
 * @param delay
 * @param debounce if true, debounce, if false throttle
 * @returns
 */
export function createBatchFn<ARG>(fn: (args: ARG[]) => void, delay?: number, debounce: boolean = true) {
  let args: ARG[] = []
  let timerId: any = null

  const debounced = () => {
    fn(args)

    // reset args and timer
    args = []
    timerId = null
  }

  if (delay) {
    return (arg: ARG) => {
      args.push(arg)
      if (timerId && debounce) {
        //only clear if debounce is true
        clearTimeout(timerId)
        timerId = null
      }
      if (!timerId) timerId = setTimeout(debounced, delay)
    }
  } else {
    //No delay (use setImmediate or setTimeout(0) for browser (since it has no setImmediate support))
    const delay = setImmediate || setTimeout

    return (arg: ARG) => {
      args.push(arg)
      if (!timerId) timerId = delay(debounced)
    }
  }
}
