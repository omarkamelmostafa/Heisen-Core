// frontend/src/services/api/endpoints/index.js

// Simple, non-circular exports for API endpoints
// export { authEndpoints } from "./auth-endpoints";
// export { userEndpoints } from "./user-endpoints";
// export { adminEndpoints } from "./admin-endpoints";

// // Individual exports for direct usage
// export { default as authEndpoints } from "./auth-endpoints";
// export { default as userEndpoints } from "./user-endpoints";

// Simple, non-circular exports for API endpoints
// export { authEndpoints } from "./auth-endpoints";
// export { userEndpoints } from "./user-endpoints";
// // export { adminEndpoints } from "./admin-endpoints";

// // Individual exports for direct usage
// export { default as authEndpoints } from "./auth-endpoints";
// export { default as userEndpoints } from "./user-endpoints";
// // export { default as adminEndpoints } from "./admin-endpoints";

// Clean, non-duplicate exports for API endpoints

// Only use named exports - remove default exports
export { authEndpoints } from "./auth-endpoints";
export { userEndpoints } from "./user-endpoints";
export { adminEndpoints } from "./admin-endpoints";

// Remove these lines - they cause duplicate exports
// export { default as authEndpoints } from './auth-endpoints';
// export { default as userEndpoints } from './user-endpoints';
