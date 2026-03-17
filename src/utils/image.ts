const DOUBAN_HOST_PATTERN = /doubanio\.com|douban\.com/i;
const DEFAULT_PROXY_ORIGIN = 'http://127.0.0.1:3001';

const stripLeadingSlash = (value: string) => value.replace(/^\/+/, '');
const stripDotPrefix = (value: string) => value.replace(/^\.\//, '');

const isRemoteUrl = (value: string) => /^https?:\/\//i.test(value);

const isLocalRuntime = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
};

export const localAsset = (value: string): string => {
  if (!value) {
    return '';
  }
  if (isRemoteUrl(value)) {
    return value;
  }

  const normalized = stripDotPrefix(stripLeadingSlash(value));
  const base = import.meta.env.BASE_URL || '/';

  if (base === './') {
    return `./${normalized}`;
  }

  const safeBase = base.endsWith('/') ? base : `${base}/`;
  return `${safeBase}${normalized}`;
};

const doubanMirror = (url: string) =>
  `https://images.weserv.nl/?url=${encodeURIComponent(url.replace(/^https?:\/\//i, ''))}&w=900&h=1300&fit=cover`;

export const resolveImageUrl = (url: string): string => {
  if (!url) {
    return '';
  }
  if (!isRemoteUrl(url)) {
    return localAsset(url);
  }

  if (!DOUBAN_HOST_PATTERN.test(url)) {
    return url;
  }

  if (!isLocalRuntime()) {
    return doubanMirror(url);
  }

  const proxyOrigin = (import.meta.env.VITE_ADMIN_API_BASE || DEFAULT_PROXY_ORIGIN).replace(/\/$/, '');
  return `${proxyOrigin}/api/proxy-image?url=${encodeURIComponent(url)}`;
};

export const fallbackCover = localAsset('uploads/mymd_promo_v2.png');

export const applyFallbackImage = (element: HTMLImageElement, fallback = fallbackCover): void => {
  if (element.dataset.fallbackApplied === '1') {
    return;
  }
  element.dataset.fallbackApplied = '1';
  element.src = fallback;
};
