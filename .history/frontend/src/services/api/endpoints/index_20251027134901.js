// frontend/src/services/api/endpoints/index.js

// Central exports for all API endpoints
// export { authEndpoints } from "./auth-endpoints";
// export { userEndpoints } from "./user-endpoints";
// export { adminEndpoints } from "./admin-endpoints";

// Convenience exports for commonly used endpoints
export { authEndpoints as auth } from "./auth-endpoints";
export { userEndpoints as user } from "./user-endpoints";
// export { adminEndpoints as admin } from "./admin-endpoints";

// Export endpoint groups for organized imports
export const endpoints = {
  auth: authEndpoints,
  user: userEndpoints,
  admin: adminEndpoints,
};
