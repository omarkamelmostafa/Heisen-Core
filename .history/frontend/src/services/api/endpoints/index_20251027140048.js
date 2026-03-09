// frontend/src/services/api/endpoints/index.js

// Central exports for all API endpoints
// Simple, non-circular exports for API endpoints
export { authEndpoints } from './auth-endpoints';
export { userEndpoints } from './user-endpoints';
export { adminEndpoints } from './admin-endpoints';

// Individual exports for direct usage
export { default as authEndpoints } from './auth-endpoints';
export { default as userEndpoints } from './user-endpoints';
export { default as adminEndpoints } from './admin-endpoints';

// Export endpoint groups for organized imports
export const endpoints = {
  auth: authEndpoints,
  user: userEndpoints,
  admin: adminEndpoints,
};
