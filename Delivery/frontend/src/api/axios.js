import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api',
});

API.interceptors.request.use((config) => {
  const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
  if (tokens.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
      if (tokens.refresh) {
        try {
          const { data } = await axios.post('http://localhost:8000/api/auth/token/refresh/', {
            refresh: tokens.refresh,
          });
          const newTokens = { 
            access: data.access, 
            refresh: data.refresh || tokens.refresh 
          };
          localStorage.setItem('tokens', JSON.stringify(newTokens));
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return API(originalRequest);
        } catch {
          // Token refresh failed, auto-logout
        }
      }
      // If no refresh token or refresh failed, clear state and redirect
      localStorage.removeItem('tokens');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
