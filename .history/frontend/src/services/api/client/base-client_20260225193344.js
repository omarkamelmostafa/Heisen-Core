// frontend/src/services/api/client/base-client.js

import axios from "axios";
import {
  API_CONFIG,
  HTTP_STATUS,
  ERROR_MESSAGES,
} from "@/lib/config/api-config";

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

    return Promise.reject(error);
  }
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

  async delete (url, config = {}) {
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
