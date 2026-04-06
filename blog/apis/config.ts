// API URL: prioritize env var, then auto-detect based on environment
function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `${window.location.protocol}//${window.location.hostname}:5302`;
  }
  return 'http://localhost:3221';
}

export const API_BASE_URL = getApiBaseUrl();

export const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};
