import { computed, onBecomeUnobserved, IComputedValue } from 'mobx'

//Used to identify transformer type
export type ITransformer<A, B> = ((object: A) => B) & { cache: TransformerCacheMap<A, B> }

export type TransformerCacheMap<A, B> = Map<A, IComputedValue<B>>

type ITransformerOptions<A, B> = {
  onCleanup?: (result: B, source: A) => void
  requiresReaction?: boolean
  cache?: TransformerCacheMap<A, B>
}

export function createTransformer<A, B, C>(
  transformer: (key: A) => B,
  options?: ITransformerOptions<A, B>
): ITransformer<A, B> {
  if (!(typeof transformer === 'function' && transformer.length < 2))
    throw new Error('createTransformer expects a function that accepts one argument')

  const { requiresReaction = false, onCleanup, cache = new Map() } = options || { cache: new Map() }

  function createView(source: A) {
    let latestValue: B
    const expr = computed(() => (latestValue = transformer(source)), { requiresReaction })
    const disposer = onBecomeUnobserved(expr, () => {
      cache.delete(source)
      disposer()
      onCleanup?.(latestValue, source)
    })
    return expr
  }

  return Object.assign(
    (key: A) => {
      //in cache
      let cacheComputed = cache.get(key)
      if (cacheComputed) return cacheComputed.get()

      // Not in cache; create a reactive view
      cacheComputed = createView(key)
      cache.set(key, cacheComputed)

      return cacheComputed.get()
    },
    { cache }
  )
}
