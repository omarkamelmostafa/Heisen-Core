// frontend/src/services/api/client/public-client.js
import axios from "axios";

const publicClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export { publicClient };
