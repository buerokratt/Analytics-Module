export function mergeChatCountArrays(arr1, arr2, arr3) {
  const result = new Map();

  mergeTheArray(arr1);
  mergeTheArray(arr2);
  mergeTheArray(arr3);

  return Array.from(result, ([key, value]) => ({ time: key, chatCount: value }));

  function mergeTheArray(arr) {
    if(!arr) return;
    for (const element of arr) {
      const key = element.time;
      let value = element.chat_count || element.chatCount || element.long_waiting_time || element.longWaitingTime;

      if(result.has(key)) {
        value += result.get(key);
      }

      result.set(key, value);
    }
  }
}
