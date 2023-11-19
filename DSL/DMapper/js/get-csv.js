function getCsv({ array, delimiter, fields }) {
  const header =
    fields ?? Array.from(new Set(array.flatMap((obj) => Object.keys(obj))));

  const headerString = header.join(delimiter);

  const replacer = (key, value) => value ?? "";

  const rowItems = array.map((row) =>
    header
      .map((fieldName) => JSON.stringify(row[fieldName], replacer))
      .join(delimiter)
  );

  const csv = [headerString, ...rowItems].join("\r\n");

  return csv;
}
