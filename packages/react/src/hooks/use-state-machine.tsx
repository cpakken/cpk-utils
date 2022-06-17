//https://github.com/radix-ui/primitives/tree/main/packages/react/presence/src/useStateMachine.tsx
import * as React from 'react'

type Machine<S> = { [k: string]: { [k: string]: S } }
type MachineState<T> = keyof T
type MachineEvent<T> = keyof UnionToIntersection<T[keyof T]>

// 🤯 https://fettblog.eu/typescript-union-to-intersection/
type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never

export function useStateMachine<M>(initialState: MachineState<M>, machine: M & Machine<MachineState<M>>) {
  return React.useReducer((state: MachineState<M>, event: MachineEvent<M>): MachineState<M> => {
    const nextState = (machine[state] as any)[event]
    return nextState ?? state
  }, initialState)
}

/**
 * const initialState = present ? 'mounted' : 'unmounted';
 * const [state, send] = useStateMachine(initialState, {
 *   mounted: {
 *     UNMOUNT: 'unmounted',
 *     ANIMATION_OUT: 'unmountSuspended',
 *   },
 *   unmountSuspended: {
 *     MOUNT: 'mounted',
 *     ANIMATION_END: 'unmounted',
 *   },
 *   unmounted: {
 *     MOUNT: 'mounted',
 *   },
 * });
 */
