import { addHiddenProp } from './add-hidden-prop'
import { computed, onBecomeUnobserved, IComputedValue } from 'mobx'

//Used to identify transformer type

export type TransformerCacheMap<A, B> = Map<A, IComputedValue<B>>

interface ITransformerOptions<A, B> {
  onCleanup?(result: B, source: A): void
  requiresReaction?: boolean
  cache?: TransformerCacheMap<A, B>
}

const $transformer = Symbol('transformer')

export function createTransformer<FN extends (arg: any) => any>(
  transformer: FN,
  options?: ITransformerOptions<Parameters<FN>[0], ReturnType<FN>>
): FN {
  if (!(typeof transformer === 'function' && transformer.length < 2))
    throw new Error('createTransformer expects a function that accepts one argument')

  const { requiresReaction = false, onCleanup, cache = new Map() } = options || { cache: new Map() }

  function createView(source: Parameters<FN>[0]) {
    let latestValue: ReturnType<FN>
    const expr = computed(() => (latestValue = transformer(source)), { requiresReaction })
    const disposer = onBecomeUnobserved(expr, () => {
      cache.delete(source)
      disposer()
      onCleanup?.(latestValue, source)
    })
    return expr
  }

  return addHiddenProp(
    (key: any) => {
      //in cache
      let cacheComputed = cache.get(key)
      if (cacheComputed) return cacheComputed.get()

      // Not in cache; create a reactive view
      cacheComputed = createView(key)
      cache.set(key, cacheComputed)

      return cacheComputed.get()
    },
    $transformer,
    cache
  ) as FN
}

export function isTransformer(fn: (arg: any) => any): boolean {
  return Boolean(fn[$transformer])
}
