// Utility to resolve user/profile image URLs and provide a consistent src
// Usage: import { resolveImageSrc } from '../utils/image';
// Pass either a user-like object or a string path.
import api from '../api/api';

const BASE_HOST = (() => {
  try {
    const base = api.defaults.baseURL || '';
    return base.replace(/\/api\/?$/, '').replace(/\/$/, '');
  } catch {
    return '';
  }
})();

const CANDIDATE_FIELDS = [
  'profileImage',
  'profilePicture',
  'avatar',
  'profilePhoto',
  'image',
  'photo',
  'displayPicture',
  'profile_pic',
  'profile_pic_url',
];

export function resolveImageSrc(input) {
  if (!input) return null;

  let path = null;

  if (typeof input === 'string') {
    path = input;
  } else if (typeof input === 'object') {
    for (const key of CANDIDATE_FIELDS) {
      const v = input[key];
      if (v && typeof v === 'string' && v.trim() !== '') {
        path = v.trim();
        break;
      }
    }
    // also support a nested 'profile' or 'data' object commonly returned by some APIs
    if (!path && input.profile && typeof input.profile === 'object') {
      for (const key of CANDIDATE_FIELDS) {
        const v = input.profile[key];
        if (v && typeof v === 'string' && v.trim() !== '') {
          path = v.trim();
          break;
        }
      }
    }
  }

  if (!path) return null;

  // Already a full URL
  if (/^https?:\/\//i.test(path)) return path;

  // If starts with // (protocol-relative) add https:
  if (/^\/\//.test(path)) return `https:${path}`;

  // If path starts with a single slash, prefix host
  if (path.startsWith('/')) {
    return `${BASE_HOST}${path}`;
  }

  // If it looks like a relative path (uploads/...), prefix host with a slash
  if (/^[\w-]+\/.+/.test(path) || path.includes('uploads') || path.includes('.jpg') || path.includes('.png') || path.includes('.jpeg')) {
    return `${BASE_HOST}/${path.replace(/^\/+/, '')}`;
  }

  // Last resort: return as-is
  return path;
}

export default {
  resolveImageSrc,
};
