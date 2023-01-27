export const reorderItem = <T>(arr: any[], predicate: (i: T) => boolean, target: number) => {
  const arrCopy = arr.slice()
  const movingItem = arrCopy.splice(arr.findIndex(predicate), 1)
  arrCopy.splice(target, 0, movingItem[0])
  return arrCopy
}
