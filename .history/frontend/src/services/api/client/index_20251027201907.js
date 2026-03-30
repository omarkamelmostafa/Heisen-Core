// frontend/src/services/api/client/index.js

// Export all API clients from a single entry point
export { publicClient } from "./public-client";
export { privateClient } from "./securedClient as privateClient-client";
export { default as BaseClient } from "./base-client";
