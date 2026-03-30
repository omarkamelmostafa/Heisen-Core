// Shared constants and re-exports for auth controllers
export const REFRESH_TOKEN_COOKIE_NAME =
  process.env.REFRESH_TOKEN_COOKIE_NAME?.replace(/"/g, "") || "refreshToken";
