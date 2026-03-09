// frontend/src/services/auth/token-manager.js
/**
 * TokenManager — Single source of truth for token lifecycle.
 *
 * Centralizes three concerns that were previously scattered across
 * refresh-queue, private-client, auth-thunks, and cookie-service:
 *
 *   1. Session detection  — hasValidSession()
 *   2. Session cleanup    — clearSession(dispatch)
 *   3. Auth failure       — handleSessionExpired()
 *
 * Phase 1: Additive only — existing code continues to work.
 * Phase 2: Modules redirect here one-at-a-time.
 * Phase 3: Dead code removed from cookie-service.
 */

import { cookieService } from "@/services/storage/cookie-service";
import { STORAGE_KEYS } from "@/services/storage/storage-constants";
import StoreAccessor from "@/store/store-accessor";
import { logout } from "@/store/slices/auth/auth-slice";

class TokenManager {
  /**
   * Check whether the current browser session has a valid access token.
   *
   * NOTE: The refresh token is set as httpOnly by the backend and is
   * invisible to JavaScript. We can only check the access token cookie.
   * If the access token is missing but the refresh token still lives in
   * the httpOnly cookie, the next API call will 401 and trigger the
   * refresh flow automatically.
   */
  hasValidSession() {
    return !!cookieService.get(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Clear all client-side auth state.
   * Called during intentional logout (user-initiated).
   *
   * @param {Function} [dispatch] - Redux dispatch. Falls back to StoreAccessor.
   */
  clearSession(dispatch) {
    const d = dispatch || StoreAccessor.dispatch.bind(StoreAccessor);

    // 1. Clear Redux auth state
    d(logout());

    // 2. Clear auth cookies (access token + any non-httpOnly data)
    cookieService.clearAuthData();
  }

  /**
   * Handle complete authentication failure — SINGLE SOURCE OF TRUTH.
   *
   * Called when:
   *   - Token refresh exhausts all retries
   *   - Persistent 401 after successful refresh
   *
   * Performs full cleanup and redirects to login with context.
   */
  handleSessionExpired() {
    console.error("TokenManager: Session expired — logging out user");

    // 1. Clear Redux + cookies
    this.clearSession();

    // 2. Redirect to login with context
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname + window.location.search;
      const returnUrl =
        currentPath !== "/login"
          ? `?returnUrl=${encodeURIComponent(currentPath)}`
          : "?session=expired";
      window.location.href = `/login${returnUrl}`;
    }
  }
}

// Singleton instance
export const tokenManager = new TokenManager();
export default tokenManager;
