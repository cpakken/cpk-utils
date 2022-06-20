// export type Assign<T1 = {}, T2 = {}> = T1 extends any ? Omit<T1, keyof T2> & T2 : never

/** Returns an object from the given object assigned with the values of another given object. */
export type Assign<T1 extends {}, T2 extends {}> = Omit<T1, keyof T2> & T2

export type Parameter<T> = T extends (arg: infer A) => any ? A : never
