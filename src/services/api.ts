import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  withCredentials: false,
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().tokens.accessToken;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error || {};
    if (response?.status === 401 && !config.__isRetryRequest) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((token: string) => {
            config.headers.Authorization = `Bearer ${token}`;
            config.__isRetryRequest = true;
            resolve(api(config));
          });
        });
      }

      try {
        isRefreshing = true;
        const refreshToken = useAuthStore.getState().tokens.refreshToken;
        if (!refreshToken) throw error;
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/auth/refresh`,
          { refreshToken }
        );
        const newAccess = data?.accessToken as string;
        useAuthStore.getState().setTokens({ accessToken: newAccess, refreshToken });
        pendingRequests.forEach((cb) => cb(newAccess));
        pendingRequests = [];
        config.headers.Authorization = `Bearer ${newAccess}`;
        config.__isRetryRequest = true;
        return api(config);
      } catch (e) {
        useAuthStore.getState().logout();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;


