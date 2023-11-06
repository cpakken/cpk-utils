export type Assert = (condition: unknown, message: string) => asserts condition

export const createInvariant = (label?: string): Assert => {
  return function invariant(cond: unknown, message: string): asserts cond {
    if (cond) return
    throw new Error(label ? `${label}: ${message}` : message)
  }
}

// invariant(condition, message) will refine types based on "condition", and
// if "condition" is false will throw an error. This function is special-cased
// in flow itself, so we can't name it anything else.
export const invariant: Assert = createInvariant()

//TODO see this instead
//https://github.com/alexreardon/tiny-invariant/blob/master/src/tiny-invariant.ts
