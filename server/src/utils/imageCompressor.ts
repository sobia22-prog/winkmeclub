import sharp from 'sharp';

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Checks if a string is a base64 encoded image or data URL
 */
export function isBase64Image(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  return str.startsWith('data:image/') || (/^[A-Za-z0-9+/=]+$/.test(str.substring(0, 100)) && str.length > 200);
}

/**
 * Compresses an image string (base64 data URL or raw base64) to optimized WebP format.
 * If input is a remote URL (http/https) or empty, it is returned untouched.
 *
 * @param input Base64 data URL, raw base64, or image URL
 * @param options Compression options (maxWidth, maxHeight, quality)
 * @returns Compressed WebP data URL: "data:image/webp;base64,..."
 */
export async function compressToWebp(
  input: string | undefined | null,
  options: CompressOptions = {}
): Promise<string> {
  if (!input || typeof input !== 'string') {
    return input as any;
  }

  const trimmed = input.trim();

  // If already an HTTP/HTTPS URL, don't alter it
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Check if it's base64 data
  let base64Data = trimmed;
  let isWebp = false;

  const dataUriMatch = trimmed.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/s);
  if (dataUriMatch) {
    const mimeType = dataUriMatch[1].toLowerCase();
    isWebp = mimeType === 'webp';
    base64Data = dataUriMatch[2];
  } else if (!trimmed.startsWith('data:')) {
    base64Data = trimmed;
  } else {
    // Other data URI (e.g. non-image)
    return input;
  }

  try {
    const inputBuffer = Buffer.from(base64Data, 'base64');
    
    // Safety check: ensure buffer is not empty
    if (!inputBuffer || inputBuffer.length === 0) {
      return input;
    }

    const maxWidth = options.maxWidth || 1200;
    const maxHeight = options.maxHeight || 1200;
    const quality = options.quality !== undefined ? options.quality : 80;

    // If it's already WebP and small (< 60KB), avoid re-compressing
    if (isWebp && inputBuffer.length < 60 * 1024) {
      const metadata = await sharp(inputBuffer).metadata().catch(() => null);
      if (metadata && (metadata.width || 0) <= maxWidth && (metadata.height || 0) <= maxHeight) {
        return trimmed.startsWith('data:image/webp;base64,')
          ? trimmed
          : `data:image/webp;base64,${base64Data}`;
      }
    }

    // Compress & convert to WebP
    const compressedBuffer = await sharp(inputBuffer)
      .rotate() // Auto-orient based on EXIF
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality,
        effort: 4, // Good balance between CPU speed and compression efficiency
      })
      .toBuffer();

    return `data:image/webp;base64,${compressedBuffer.toString('base64')}`;
  } catch (error) {
    console.warn('[ImageCompressor] Failed to compress image to WebP, preserving original:', error);
    return input;
  }
}

/**
 * Utility to compress specific image fields on an object in-place or returning updated object.
 * Handles both string fields and string arrays (like galleryImages).
 */
export async function compressImageFields<T extends Record<string, any>>(
  obj: T,
  fields: string[],
  options?: CompressOptions
): Promise<T> {
  if (!obj || typeof obj !== 'object') return obj;
  const target = obj as any;

  for (const field of fields) {
    const val = target[field];
    if (typeof val === 'string' && val.length > 0) {
      target[field] = await compressToWebp(val, options);
    } else if (Array.isArray(val)) {
      target[field] = await Promise.all(
        val.map((item) => (typeof item === 'string' ? compressToWebp(item, options) : item))
      );
    }
  }

  return obj;
}
