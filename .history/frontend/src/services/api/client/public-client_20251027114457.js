// frontend/src/services/api/client/public-client.js
import BaseClient from "./base-client";

class PublicClient extends BaseClient {
  constructor() {
    super();

    // Override base interceptors for public routes
    this.setupPublicInterceptors();
  }

  setupPublicInterceptors() {
    // Remove any auth-related headers for public client
    this.instance.interceptors.request.use(
      (config) => {
        // Ensure no authorization header is set
        if (config.headers) {
          delete config.headers.Authorization;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Public-specific methods
  async healthCheck() {
    return this.get("/health");
  }

  async getPublicData(endpoint) {
    return this.get(`/public/${endpoint}`);
  }
}

// Singleton instance for public routes
export const publicClient = new PublicClient();
export default publicClient;
// import axios from "axios";

// const publicClient = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
//   timeout: 10000,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export { publicClient };
