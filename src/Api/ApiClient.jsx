import axios from 'axios';

const AUTH_PREFIX = '/auth';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BASEURL || 'http://localhost:5000/api',
});

apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  refreshQueue = [];
};

export const clearSessionAndRedirect = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
  window.location.href = '/';
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config: originalRequest } = error;

    if (!response) {
      return Promise.reject(error);
    }

    if (response.status === 403) {
      const resData = response.data;
      let errorMsg = 'Access Denied: You do not have permission to perform this action.';
      if (typeof resData?.message === 'string') {
        errorMsg = resData.message;
      }
      try {
        sessionStorage.setItem('not_authorized_message', errorMsg);
        sessionStorage.setItem('not_authorized_from', window.location.pathname);
      } catch {
        // Safe ignore
      }
      window.location.href = `/not-authorized?error=${encodeURIComponent(errorMsg)}`;
      return Promise.reject(error);
    }

    const isAuthEndpoint =
      originalRequest.url?.includes(`${AUTH_PREFIX}/login`) ||
      originalRequest.url?.includes(`${AUTH_PREFIX}/verify-otp`) ||
      originalRequest.url?.includes(`${AUTH_PREFIX}/refresh-token`);

    if (response.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        clearSessionAndRedirect();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_BASEURL || 'http://localhost:5000/api'}${AUTH_PREFIX}/refresh-token`,
          { refresh_token: refreshToken }
        );
        const { access_token, refresh_token: newRefresh } = data.data;

        localStorage.setItem('accessToken', access_token);
        if (newRefresh) localStorage.setItem('refreshToken', newRefresh);

        processQueue(null, access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearSessionAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
