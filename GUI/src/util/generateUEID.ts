export const generateUEID = () => {
  const [first, second] = [(Math.random() * 46656) | 0, (Math.random() * 46656) | 0]
      .map((value) => ('000' + value.toString(36)).slice(-3));

  return first + second;
};
