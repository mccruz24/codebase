const MAX_FILE_SIZE = 500 * 1024; // 500KB
const MAX_DIMENSION = 1200; // Max width or height in pixels

/**
 * Compresses an image file using canvas.
 * Resizes to fit within MAX_DIMENSION and iteratively reduces
 * JPEG quality until the result is under MAX_FILE_SIZE.
 *
 * Returns a Base64 data URL string.
 */
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Scale down if either dimension exceeds max
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Iteratively reduce quality until under size limit
      let quality = 0.8;
      let result = canvas.toDataURL('image/jpeg', quality);

      while (result.length > MAX_FILE_SIZE * 1.37 && quality > 0.1) {
        // 1.37 accounts for Base64 overhead (~37% larger than binary)
        quality -= 0.1;
        result = canvas.toDataURL('image/jpeg', quality);
      }

      resolve(result);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
