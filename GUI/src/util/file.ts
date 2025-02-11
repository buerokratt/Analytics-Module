import { Buffer } from 'buffer';

export const saveFile = async (base64String: string, fileName: string, type: string) => {
  const blob = new Blob([Buffer.from(base64String, 'base64')], {
    type: type,
  });

  if (window.showSaveFilePicker) {
    const handle = await window.showSaveFilePicker({ suggestedName: fileName });
    const writable = await handle.createWritable();
    await writable.write(blob);
    writable.close();
  } else {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }
};
