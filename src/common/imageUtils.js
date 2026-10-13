/**
 * ===========================================
 *  KhetSetu Universal Image URL Resolver
 * ===========================================
 * Resolves images from local uploads (served by backend on Render)
 * as well as remote HTTPS/CDN images, with fallback guards.
 */

const RAW_API_URL = import.meta.env.VITE_BASEURL || 'http://localhost:5000/api';
export const BACKEND_URL = RAW_API_URL.replace(/\/api\/?$/, '');

export const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80';

/**
 * Converts a raw image string or path into a fully qualified image URL.
 * Handles:
 * - Full HTTPS URLs (Unsplash, Cloudinary, S3, etc.)
 * - Data URLs (base64) and Blob URLs (local preview)
 * - Relative backend paths like '/uploads/documents/xxx.jpg'
 */
export const getImageUrl = (url, fallback = DEFAULT_FALLBACK_IMAGE) => {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Prepend backend host to relative uploads
  return `${BACKEND_URL}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};

/**
 * Extracts and resolves the first valid image from a product or item.
 */
export const getFirstImage = (item, fallback = DEFAULT_FALLBACK_IMAGE) => {
  if (!item) return fallback;

  const cropFallback = item.crop?.image_url ? getImageUrl(item.crop.image_url, fallback) : fallback;

  let imgs = item.images || item.photos;
  if (typeof imgs === 'string') {
    try {
      imgs = JSON.parse(imgs);
    } catch {
      imgs = [imgs];
    }
  }

  if (Array.isArray(imgs) && imgs.length > 0 && imgs[0]) {
    const raw = String(imgs[0]).trim();
    // Dead blob URLs from past sessions, PDFs, and KYC documents cannot be used as crop photos
    if (
      raw.startsWith('blob:') ||
      raw.includes('kyc-') ||
      raw.includes('/documents/') ||
      raw.toLowerCase().endsWith('.pdf')
    ) {
      return cropFallback;
    }
    return getImageUrl(raw, cropFallback);
  }

  if (item.crop?.image_url) {
    return getImageUrl(item.crop.image_url, fallback);
  }

  return fallback;
};

/**
 * Extracts and resolves an array of valid images for product gallery views.
 */
export const getProductImages = (item, fallback = DEFAULT_FALLBACK_IMAGE) => {
  if (!item) return [fallback];
  const cropFallback = item.crop?.image_url ? getImageUrl(item.crop.image_url, fallback) : fallback;

  let imgs = item.images || item.photos;
  if (typeof imgs === 'string') {
    try {
      imgs = JSON.parse(imgs);
    } catch {
      imgs = [imgs];
    }
  }

  if (Array.isArray(imgs) && imgs.length > 0) {
    const valid = imgs
      .filter((img) => {
        if (!img || typeof img !== 'string') return false;
        const trimmed = img.trim();
        return (
          trimmed &&
          !trimmed.startsWith('blob:') &&
          !trimmed.includes('kyc-') &&
          !trimmed.includes('/documents/') &&
          !trimmed.toLowerCase().endsWith('.pdf')
        );
      })
      .map((img) => getImageUrl(img, cropFallback));

    if (valid.length > 0) return valid;
  }

  return [cropFallback];
};
