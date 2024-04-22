export function mergeChatCountArrays(arr1, arr2, arr3) {
  const result = new Map();

  mergeTheArray(arr1);
  mergeTheArray(arr2);
  mergeTheArray(arr3);

  return Array.from(result, ([key, value]) => ({ time: key, chatCount: value }));

  function mergeTheArray(arr) {
    if(!arr) return;
    for (let i = 0; i < arr.length; i++) {
      const key = arr[i].time;
      let value = arr[i].chat_count || arr[i].chatCount || arr[i].long_waiting_time || arr[i].longWaitingTime;

      if(result.has(key)) {
        value += result.get(key);
      }

      result.set(key, value);
    }
  }
}
