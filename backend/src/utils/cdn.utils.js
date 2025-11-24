/**
 * CDN Utilities
 *
 * Utilities for CDN integration, asset optimization, and static file serving.
 *
 * Usage:
 *   const { getCDNUrl, optimizeImage } = require('./utils/cdn.utils');
 *
 *   // Get CDN URL for asset
 *   const url = getCDNUrl('/images/logo.png');
 *
 *   // Optimize image
 *   const optimized = await optimizeImage(imageBuffer, { width: 800, quality: 80 });
 */

const path = require('path');
const logger = require('../config/logger');
const { cdn: cdnConfig } = require('../config/env.config');

/**
 * Get CDN URL for an asset
 * @param {string} assetPath - Asset path
 * @param {object} options - Options
 * @returns {string} - Full CDN URL
 */
function getCDNUrl(assetPath, options = {}) {
  const {
    version = null,
    absolute = true,
  } = options;

  // If CDN is not enabled, return local path
  if (!cdnConfig.enabled || !cdnConfig.url) {
    return absolute ? `${process.env.BACKEND_URL}${assetPath}` : assetPath;
  }

  // Clean asset path
  const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;

  // Add version query parameter for cache busting
  const versionParam = version ? `?v=${version}` : '';

  return `${cdnConfig.url}/${cleanPath}${versionParam}`;
}

/**
 * Get Cloudinary URL for image
 * @param {string} publicId - Cloudinary public ID
 * @param {object} transformations - Image transformations
 * @returns {string} - Cloudinary URL
 */
function getCloudinaryUrl(publicId, transformations = {}) {
  const {
    width = null,
    height = null,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    effect = null,
    gravity = 'auto',
  } = transformations;

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    logger.warn('Cloudinary cloud name not configured');
    return publicId;
  }

  const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;

  // Build transformation string
  const transforms = [];

  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop) transforms.push(`c_${crop}`);
  if (quality) transforms.push(`q_${quality}`);
  if (format) transforms.push(`f_${format}`);
  if (effect) transforms.push(`e_${effect}`);
  if (gravity) transforms.push(`g_${gravity}`);

  const transformString = transforms.join(',');

  return `${baseUrl}/${transformString}/${publicId}`;
}

/**
 * Generate responsive image URLs
 * @param {string} publicId - Cloudinary public ID or asset path
 * @param {object} options - Options
 * @returns {object} - Responsive image URLs
 */
function getResponsiveImages(publicId, options = {}) {
  const {
    widths = [320, 640, 768, 1024, 1280, 1920],
    quality = 'auto',
    format = 'auto',
  } = options;

  const images = {};

  widths.forEach((width) => {
    images[`${width}w`] = getCloudinaryUrl(publicId, {
      width,
      quality,
      format,
      crop: 'fill',
    });
  });

  return images;
}

/**
 * Get video streaming URL
 * @param {string} publicId - Cloudinary public ID
 * @param {object} options - Video options
 * @returns {string} - Video URL
 */
function getVideoUrl(publicId, options = {}) {
  const {
    quality = 'auto',
    format = 'auto',
    width = null,
    height = null,
  } = options;

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    logger.warn('Cloudinary cloud name not configured');
    return publicId;
  }

  const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`;

  const transforms = [];
  if (quality) transforms.push(`q_${quality}`);
  if (format) transforms.push(`f_${format}`);
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);

  const transformString = transforms.join(',');

  return `${baseUrl}/${transformString}/${publicId}`;
}

/**
 * Generate image srcset for responsive images
 * @param {string} publicId - Cloudinary public ID
 * @param {object} options - Options
 * @returns {string} - srcset string
 */
function generateSrcset(publicId, options = {}) {
  const responsiveImages = getResponsiveImages(publicId, options);

  return Object.entries(responsiveImages)
    .map(([size, url]) => `${url} ${size}`)
    .join(', ');
}

/**
 * Get optimized thumbnail URL
 * @param {string} publicId - Cloudinary public ID
 * @param {object} options - Options
 * @returns {string} - Thumbnail URL
 */
function getThumbnailUrl(publicId, options = {}) {
  const {
    width = 200,
    height = 200,
    crop = 'thumb',
    gravity = 'face',
  } = options;

  return getCloudinaryUrl(publicId, {
    width,
    height,
    crop,
    gravity,
    quality: 'auto',
    format: 'auto',
  });
}

/**
 * Get placeholder image URL (blur-up technique)
 * @param {string} publicId - Cloudinary public ID
 * @returns {string} - Placeholder URL
 */
function getPlaceholderUrl(publicId) {
  return getCloudinaryUrl(publicId, {
    width: 20,
    quality: 'auto:low',
    format: 'auto',
    effect: 'blur:1000',
  });
}

/**
 * Asset cache headers configuration
 * @param {string} assetType - Asset type (image, video, font, etc.)
 * @returns {object} - Cache headers
 */
function getAssetCacheHeaders(assetType) {
  const cacheStrategies = {
    image: {
      'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
      'Expires': new Date(Date.now() + 31536000000).toUTCString(),
    },
    video: {
      'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
      'Expires': new Date(Date.now() + 31536000000).toUTCString(),
    },
    font: {
      'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
      'Expires': new Date(Date.now() + 31536000000).toUTCString(),
    },
    css: {
      'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
      'Expires': new Date(Date.now() + 31536000000).toUTCString(),
    },
    js: {
      'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
      'Expires': new Date(Date.now() + 31536000000).toUTCString(),
    },
    html: {
      'Cache-Control': 'no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    default: {
      'Cache-Control': 'public, max-age=3600', // 1 hour
      'Expires': new Date(Date.now() + 3600000).toUTCString(),
    },
  };

  return cacheStrategies[assetType] || cacheStrategies.default;
}

/**
 * Static file serving middleware
 * @param {string} assetType - Asset type
 * @returns {Function} - Express middleware
 */
function serveWithCache(assetType) {
  return (req, res, next) => {
    const headers = getAssetCacheHeaders(assetType);

    Object.entries(headers).forEach(([key, value]) => {
      res.set(key, value);
    });

    next();
  };
}

/**
 * Image format recommendations
 * @param {string} originalFormat - Original image format
 * @param {boolean} supportsWebP - Browser supports WebP
 * @param {boolean} supportsAVIF - Browser supports AVIF
 * @returns {string} - Recommended format
 */
function getRecommendedImageFormat(originalFormat, supportsWebP, supportsAVIF) {
  // AVIF is most efficient (if supported)
  if (supportsAVIF) {
    return 'avif';
  }

  // WebP is next best (if supported)
  if (supportsWebP) {
    return 'webp';
  }

  // Fall back to original or JPEG
  if (originalFormat === 'png' && !supportsWebP) {
    return 'png';
  }

  return 'jpg';
}

/**
 * Check if browser supports modern image formats
 * @param {object} req - Express request
 * @returns {object} - Support flags
 */
function checkImageFormatSupport(req) {
  const accept = req.headers.accept || '';

  return {
    webp: accept.includes('image/webp'),
    avif: accept.includes('image/avif'),
    svg: accept.includes('image/svg+xml'),
  };
}

/**
 * Generate optimized image URL based on browser support
 * @param {string} publicId - Cloudinary public ID
 * @param {object} req - Express request
 * @param {object} transformations - Image transformations
 * @returns {string} - Optimized image URL
 */
function getOptimizedImageUrl(publicId, req, transformations = {}) {
  const support = checkImageFormatSupport(req);

  // Determine best format
  let format = 'auto';
  if (support.avif) {
    format = 'avif';
  } else if (support.webp) {
    format = 'webp';
  }

  return getCloudinaryUrl(publicId, {
    ...transformations,
    format,
    quality: 'auto',
  });
}

/**
 * CDN purge/invalidation helper
 * @param {string|string[]} paths - Paths to purge
 * @returns {Promise<boolean>} - Success status
 */
async function purgeCDNCache(paths) {
  try {
    // Implementation depends on CDN provider
    // For Cloudinary, use their API
    // For CloudFront, use AWS SDK
    // For custom CDN, implement accordingly

    logger.info('CDN cache purge requested', {
      paths: Array.isArray(paths) ? paths : [paths],
    });

    // Example: Cloudinary invalidation
    if (process.env.CLOUDINARY_API_KEY) {
      const cloudinary = require('cloudinary').v2;

      const publicIds = Array.isArray(paths) ? paths : [paths];
      await cloudinary.api.delete_resources(publicIds, {
        invalidate: true,
      });

      logger.info('CDN cache purged successfully', { count: publicIds.length });
      return true;
    }

    logger.warn('CDN purge not implemented for current provider');
    return false;
  } catch (error) {
    logger.error('CDN cache purge failed', {
      error: error.message,
      paths,
    });
    return false;
  }
}

/**
 * Asset preloading configuration
 * @param {string[]} assets - Assets to preload
 * @returns {string} - Link header value
 */
function generatePreloadHeaders(assets) {
  const preloadLinks = assets.map((asset) => {
    const ext = path.extname(asset).slice(1);
    const asType = {
      js: 'script',
      css: 'style',
      woff: 'font',
      woff2: 'font',
      ttf: 'font',
      jpg: 'image',
      jpeg: 'image',
      png: 'image',
      webp: 'image',
      svg: 'image',
    }[ext] || 'fetch';

    const crossorigin = ['font', 'script'].includes(asType) ? '; crossorigin' : '';

    return `<${asset}>; rel=preload; as=${asType}${crossorigin}`;
  });

  return preloadLinks.join(', ');
}

/**
 * Asset versioning for cache busting
 * @param {string} asset - Asset path
 * @returns {string} - Versioned asset path
 */
function versionAsset(asset) {
  const version = process.env.APP_VERSION || Date.now();
  const separator = asset.includes('?') ? '&' : '?';
  return `${asset}${separator}v=${version}`;
}

/**
 * Get content type from extension
 * @param {string} filename - Filename
 * @returns {string} - Content type
 */
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();

  const contentTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
  };

  return contentTypes[ext] || 'application/octet-stream';
}

module.exports = {
  // CDN URLs
  getCDNUrl,
  getCloudinaryUrl,
  getVideoUrl,

  // Image optimization
  getResponsiveImages,
  generateSrcset,
  getThumbnailUrl,
  getPlaceholderUrl,
  getOptimizedImageUrl,

  // Image format detection
  checkImageFormatSupport,
  getRecommendedImageFormat,

  // Cache headers
  getAssetCacheHeaders,
  serveWithCache,

  // CDN management
  purgeCDNCache,

  // Asset utilities
  generatePreloadHeaders,
  versionAsset,
  getContentType,
};
