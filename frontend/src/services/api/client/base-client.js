// frontend/src/services/api/client/base-client.js

import axios from "axios";
import {
  API_CONFIG,
  HTTP_STATUS,
  ERROR_MESSAGES,
} from "@/lib/config/api-config";
import storeAccessor from "@/store/store-accessor";
import { clearCredentials, setSessionExpired, updateAccessToken } from "@/store/slices/auth/auth-slice";
import { notify } from "@/lib/notify";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

class BaseClient {
  constructor(baseURL = API_CONFIG.FULL_BASE_URL) {
    this.instance = axios.create({
      baseURL, // Now uses: http://localhost:3001/api/v1
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  // Setup request and response interceptors
  setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      this.handleRequestSuccess.bind(this),
      this.handleRequestError.bind(this)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      this.handleResponseSuccess.bind(this),
      this.handleResponseError.bind(this)
    );
  }

  // Successful request handler
  handleRequestSuccess(config) {
    // Add timestamp for request tracking
    config.metadata = { startTime: Date.now() };

    // Attach Authorization header if access token exists in Redux store
    const state = storeAccessor.getState();
    const token = state?.auth?.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.withCredentials = true;

    if (process.env.NODE_ENV === "development") {
      console.log(`🚀 [API] ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }

    return config;
  }

  // Request error handler
  handleRequestError(error) {
    console.error("❌ [API] Request Error:", error);
    return Promise.reject(error);
  }

  // Successful response handler
  handleResponseSuccess(response) {
    const duration =
      Date.now() - (response.config.metadata?.startTime || Date.now());

    if (process.env.NODE_ENV === "development") {
      console.log(
        `✅ [API] ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          duration: `${duration}ms`,
          data: response.data,
        }
      );
    }

    return response;
  }

  // Response error handler
  handleResponseError(error) {
    const duration =
      Date.now() - (error.config?.metadata?.startTime || Date.now());

    if (process.env.NODE_ENV === "development") {
      console.error(
        `❌ [API] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        {
          status: error.response?.status,
          duration: `${duration}ms`,
          error: error.response?.data || error.message,
        }
      );
    }

    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response?.data?.errorCode === "TOKEN_EXPIRED"
    ) {
      if (originalRequest._retry) {
        storeAccessor.dispatch(clearCredentials());
        storeAccessor.dispatch(setSessionExpired(true));

        notify.warning("Your session has expired. Please log in again.", {
          id: "session-expired",
        });

        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.instance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      return new Promise((resolve, reject) => {
        // Plain axios instance for refresh to avoid interceptor loop
        axios
          .post(`${API_CONFIG.FULL_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
          .then((res) => {
            const newAccessToken = res.data?.data?.accessToken;
            storeAccessor.dispatch(updateAccessToken(newAccessToken));

            isRefreshing = false;
            processQueue(null, newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            resolve(this.instance(originalRequest));
          })
          .catch((err) => {
            storeAccessor.dispatch(clearCredentials());
            storeAccessor.dispatch(setSessionExpired(true));
            isRefreshing = false;
            processQueue(err, null);

            notify.warning("Your session has expired. Please log in again.", {
              id: "session-expired",
            });

            reject(err);
          });
      });
    }

    if (!error.response) {
      notify.error("Unable to connect. Check your internet connection.", {
        id: "global-network",
      });
    } else {
      if (error.response.status === 403) {
        const errorCode = error.response?.data?.errorCode;
        if (errorCode !== "ACCOUNT_NOT_VERIFIED") {
          notify.error("You don't have permission to perform this action.", {
            id: "global-403",
          });
        }
      }
      if (error.response.status === 429) {
        const retryAfter = error.response.headers["retry-after"];
        let waitMessage = "Too many requests. Please wait a moment.";

        if (retryAfter) {
          const seconds = parseInt(retryAfter, 10);
          if (!isNaN(seconds)) {
            const minutes = Math.ceil(seconds / 60);
            waitMessage = minutes > 1
              ? `Too many requests. Please wait ${minutes} minutes.`
              : `Too many requests. Please wait ${seconds} seconds.`;
          }
        }

        notify.warning(waitMessage, { id: "global-429" });
      }
      if (error.response.status === 500) {
        notify.error("Something went wrong on our end. Please try again.", {
          id: "global-500",
        });
      }
      if ([502, 503, 504].includes(error.response.status)) {
        notify.error("Service temporarily unavailable. Please try again.", {
          id: "global-5xx",
        });
      }
    }

    return Promise.reject(error);
  }

  // HTTP methods with enhanced error handling
  async get(url, config = {}) {
    return this.instance.get(url, config);
  }

  async post(url, data = {}, config = {}) {
    return this.instance.post(url, data, config);
  }

  async put(url, data = {}, config = {}) {
    return this.instance.put(url, data, config);
  }

  async patch(url, data = {}, config = {}) {
    return this.instance.patch(url, data, config);
  }

  async delete(url, config = {}) {
    return this.instance.delete(url, config);
  }

  // File upload with progress support
  async upload(url, formData, onProgress = null, config = {}) {
    return this.instance.post(url, formData, {
      ...config,
      headers: {
        "Content-Type": "multipart/form-data",
        ...config.headers,
      },
      onUploadProgress: onProgress,
    });
  }

  createAbortController() {
    return new AbortController();
  }
}

export default BaseClient;
