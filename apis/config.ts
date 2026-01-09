
export const API_BASE_URL = 'https://api.skyverses.com';

export const getHeaders = () => {
  const token = localStorage.getItem('skyverses_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};
