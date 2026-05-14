/**
 * Splits a Blob into an array of smaller chunks.
 * @param {Blob} blob - The source Blob or File.
 * @param {number} chunkSize - Size of each chunk in bytes (default 4MB).
 * @returns {Blob[]} An array of Blob chunks.
 */
export function sliceBlob(blob: Blob, chunkSize = 4 * 1024 * 1024) {
  const chunks = [];
  let cur = 0;

  while (cur < blob.size) {
    const chunk = blob.slice(cur, cur + chunkSize);
    chunks.push(chunk);
    cur += chunkSize;
  }

  return chunks;
}
