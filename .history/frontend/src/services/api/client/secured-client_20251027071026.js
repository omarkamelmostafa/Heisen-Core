// frontend/src/services/api/client/secured-client.js
import axios from "axios";
import { AuthInterceptor } from "../../interceptors/auth-interceptor";

const securedClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Apply auth interceptor
new AuthInterceptor(securedClient);

export { securedClient };
