// frontend/src/services/auth/token-manager.js
/**
 * TokenManager — Single source of truth for token lifecycle.
 *
 * Centralizes three concerns:
 *   1. Session detection  — hasValidSession()
 *   2. Session cleanup    — clearSession(dispatch)
 *   3. Auth failure       — handleSessionExpired()
 *
 * Access token is stored in Redux state only (not cookies, not localStorage).
 * The refresh token is HttpOnly and invisible to JavaScript.
 */

import StoreAccessor from "@/store/store-accessor";
import { logout } from "@/store/slices/auth/auth-slice";

class TokenManager {
  /**
   * Check whether the current session has a valid access token.
   *
   * Checks Redux state for the in-memory access token (FR-010).
   * If the access token is missing but the refresh token cookie exists
   * (invisible to JS), the next API call will 401 and trigger the
   * refresh flow automatically.
   */
  hasValidSession() {
    try {
      const state = StoreAccessor.getState();
      return !!state?.auth?.accessToken;
    } catch {
      return false;
    }
  }

  /**
   * Clear all client-side auth state.
   * Called during intentional logout (user-initiated).
   *
   * Does NOT attempt to clear the refresh token cookie — it is HttpOnly
   * and can only be cleared by the backend via the /logout endpoint.
   *
   * @param {Function} [dispatch] - Redux dispatch. Falls back to StoreAccessor.
   */
  clearSession(dispatch) {
    const d = dispatch || StoreAccessor.dispatch.bind(StoreAccessor);

    // Clear Redux auth state (access token, user, isAuthenticated)
    d(logout());
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
    // 1. Clear Redux state
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
