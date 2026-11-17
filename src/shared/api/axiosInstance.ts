
import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import {
  getAccessToken,
  clearTokens,
} from "./authStorage";

const baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

const AUTH_PATHS = [
  "/auth/login",
  "/auth/forgot-password",
  "/auth/reset-password",
];

const isAuthUrl = (url = "") =>
  AUTH_PATHS.some((path) => url.includes(path));

// Attach JWT automatically
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  }
);

// Handle expired or invalid JWT
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (
      error.response?.status === 401 &&
      !isAuthUrl(error.config?.url)
    ) {
      clearTokens();

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
