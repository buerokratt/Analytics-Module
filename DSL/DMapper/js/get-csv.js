function getCsv({array, delimiter, fields}) {
    const header = fields ?? Object.keys(array[0]);
  
    const headerString = header.join(delimiter);
  
    const replacer = (key, value) => value ?? '';
  
    const rowItems = array.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(delimiter)
    );
  
    const csv = [headerString, ...rowItems].join('\r\n');
  
    return csv;
}
