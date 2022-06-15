export function setDeep(obj: any, props: string[], val: any) {
  const lastIdx = props.length - 1

  for (let i = 0; i < lastIdx; i++) {
    const prop = props[i]
    if (!(prop in obj)) obj[prop] = {}
    obj = obj[prop]
  }
  if (lastIdx >= 0) obj[props[lastIdx]] = val
}

export function getDeep(obj: any, props: string[]) {
  let next = obj
  for (const prop of props) {
    if (!(prop in obj)) return undefined
    next = obj[prop]
  }

  return next
}
