const hashKey = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const { length } = hashKey
// import { randomUUID } from 'crypto'

export const hashInt = (integer: number) => {
  let hash = ''
  let i = integer
  do {
    hash = hashKey[i % length] + hash
    i = Math.floor(i / length)
  } while (i > 0)
  return hash
}

export const intHash = (hash: string) => {
  let integer = 0
  for (let i = 0; i < hash.length; i++) {
    integer = integer * length + hashKey.indexOf(hash[i])
  }
  return integer
}

// export const genId = () => {
//   return hashInt(parseInt(randomUUID().split('-').at(-1)!, 16))
// }
