import { useAuthStore } from '@/store/useAuthStore';
import axios from 'axios';

const api = axios.create({
  baseURL:
    import.meta.env.MODE === 'development'
      ? 'http://localhost:5001/api'
      : '/api',
  withCredentials: true, // send cookie to server
});

// Interceptors: gắn access token vào toàn bộ api vào req header
api.interceptors.request.use(config => {
  // khi gọi .getState chỉ lấy giá trị tại thời điểm dòng code này chạy.
  // Nếu sau đó giá trị thay đổi thì biến này vẫn dữ nguyên không cập nhật nữa
  const { accessToken } = useAuthStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// auto refresh when access token expire
api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    // Apis need to check
    if (
      originalRequest.url.includes('/auth/signin') ||
      originalRequest.url.includes('/auth/signup') ||
      originalRequest.url.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }
    originalRequest._retryCount = originalRequest._retryCount || 0;

    if (error.response?.status === 403 && originalRequest._retryCount < 4) {
      originalRequest._retryCount += 1;

      try {
        const res = await api.post(
          '/auth/refresh',
          {},
          { withCredentials: true }
        );
        const newAccessToken = res.data.accessToken;
        useAuthStore.getState().setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearState();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
