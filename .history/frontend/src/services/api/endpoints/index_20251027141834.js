// frontend/src/services/api/endpoints/index.js

// Simple, non-circular exports for API endpoints
// export { authEndpoints } from "./auth-endpoints";
// export { userEndpoints } from "./user-endpoints";
// export { adminEndpoints } from "./admin-endpoints";

// // Individual exports for direct usage
// export { default as authEndpoints } from "./auth-endpoints";
// export { default as userEndpoints } from "./user-endpoints";

// Central exports for all API endpoints - Fixed circular dependency

// Import and export individually to avoid circular dependencies
export { authEndpoints } from "./auth-endpoints";
export { userEndpoints } from "./user-endpoints";
export { adminEndpoints } from "./admin-endpoints";

// Convenience exports for commonly used endpoints
export { authEndpoints as auth } from "./auth-endpoints";
export { userEndpoints as user } from "./user-endpoints";
export { adminEndpoints as admin } from "./admin-endpoints";

// Export endpoint groups - REMOVE THIS SECTION OR FIX IT
// The circular dependency happens here because endpoints are used before they're defined

// Instead, create a simple object without re-exporting the same variables
export const endpoints = {
  // This will be populated after all modules are loaded
};

// Initialize endpoints after all imports are done
setTimeout(() => {
  endpoints.auth = authEndpoints;
  endpoints.user = userEndpoints;
  endpoints.admin = adminEndpoints;
}, 0);
