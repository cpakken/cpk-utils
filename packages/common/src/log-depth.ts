import util from 'node:util'

export function logDepth(...args: any[]) {
  return (depth = 5) => {
    console.log(...args.map((a) => util.inspect(a, { depth, colors: true })))
  }
}

export const log5 = (...args: any[]) => logDepth(...args)(5)
