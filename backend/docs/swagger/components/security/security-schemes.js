export const securitySchemes = {
  BearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "JWT access token. Obtained from /auth/login or /auth/refresh. Short-lived (15 minutes). Stored in application memory only (never localStorage).",
  },
  CookieAuth: {
    type: "apiKey",
    in: "cookie",
    name: "refresh_token",
    description: "HTTP-only refresh token cookie. Set automatically by the server on login. Long-lived (7 days). Used to obtain new access tokens via /auth/refresh.",
  },
};
