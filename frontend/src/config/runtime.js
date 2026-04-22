function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

function deriveSocketUrl(apiBaseUrl) {
  if (!apiBaseUrl || apiBaseUrl.startsWith('/')) {
    return typeof window !== 'undefined' ? window.location.origin : '';
  }

  return apiBaseUrl.replace(/\/api$/i, '');
}

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const apiBaseUrl = trimTrailingSlash(rawApiBaseUrl || '/api');

const rawSocketUrl = import.meta.env.VITE_SOCKET_URL?.trim();
const socketUrl = trimTrailingSlash(rawSocketUrl || deriveSocketUrl(apiBaseUrl));

const rawMlUrl = import.meta.env.VITE_ML_URL?.trim();
const mlUrl = trimTrailingSlash(rawMlUrl || 'http://localhost:8000');

export { apiBaseUrl, mlUrl, socketUrl };
