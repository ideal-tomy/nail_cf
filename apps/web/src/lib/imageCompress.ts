async function resizeToJpeg(file: File, maxEdge: number, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('Canvas is not available');
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
      'image/jpeg',
      quality,
    );
  });
}

export async function compressForUpload(file: File): Promise<{ display: Blob; thumb: Blob }> {
  const [display, thumb] = await Promise.all([
    resizeToJpeg(file, 1600),
    resizeToJpeg(file, 400, 0.8),
  ]);
  return { display, thumb };
}
