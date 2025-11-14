export const reorderItem = <T>(arr: T[], predicate: (i: T) => boolean, target: number) => {
  const arrCopy = arr.slice()
  const movingItem = arrCopy.splice(arr.findIndex(predicate), 1)
  arrCopy.splice(target, 0, movingItem[0])
  let result =  arrCopy.map((item, index) => ({
    ...item,
    ordinality: index + 1,
  }))
  console.log('SORTING', result);
  return result;
}
