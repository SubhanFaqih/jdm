/**
 * Membuat objek Image dari URL
 */
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // Menghindari isu CORS
    image.src = url;
  });

/**
 * Menghasilkan blob gambar hasil crop menggunakan Canvas
 */
export async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Set ukuran canvas sesuai hasil crop
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Gambar bagian dari gambar asal ke canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Mengubah canvas menjadi Blob (File Image)
  return new Promise((resolve, reject) => {
    canvas.toBlob((file) => {
      if (!file) {
        reject(new Error('Canvas is empty'));
        return;
      }
      resolve(file);
    }, 'image/png');
  });
}
