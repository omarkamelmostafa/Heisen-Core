// frontend/src/services/api/refresh-queue.js
import { tokenManager } from '@/services/auth/token-manager';
import { authService } from '@/services/domain/auth-service';

/**
 * Refresh Queue Manager
 * Sole orchestrator for token refresh lifecycle.
 * Handles concurrent token refresh scenarios and request queuing.
 * Prevents multiple refresh token calls when multiple requests fail simultaneously.
 *
 * Auth failure flow (consolidated — single source of truth):
 *   1. No token      → PrivateClient short-circuits to /login (never reaches here)
 *   2. Expired token  → handleTokenRefresh() → authService.refreshToken()
 *   3. Refresh fails  → handleAuthFailure() → logout + redirect
 */
class RefreshQueue {
  constructor() {
    this.isRefreshing = false;
    this.pendingRequests = [];
    this.maxQueueSize = 50;
    this.retryAttempts = 0;
    this.maxRetries = 3;
  }

  /**
   * Add a failed request to the queue for retry after token refresh
   */
  addToQueue(failedRequest) {
    if (this.pendingRequests.length >= this.maxQueueSize) {
      this.pendingRequests = this.pendingRequests.slice(-this.maxQueueSize / 2);
    }

    this.pendingRequests.push(failedRequest);
  }

  /**
   * Process all pending requests after successful token refresh
   */
  async processQueue(newToken) {
    if (this.pendingRequests.length === 0) {
      return;
    }

    // Create a copy and clear the original queue immediately
    const requestsToProcess = [...this.pendingRequests];
    this.pendingRequests = [];
    this.retryAttempts = 0;

    // Process all queued requests with the new token
    const results = await Promise.allSettled(
      requestsToProcess.map(request => this.retryRequest(request, newToken))
    );

    // Log results for monitoring
    this.logRetryResults(results);
  }

  /**
   * Retry a single failed request with the new token
   */
  async retryRequest(failedRequest, newToken) {
    try {
      const retryConfig = {
        ...failedRequest.config,
        _retry: true // Mark as retry to prevent infinite loops
      };

      const response = await failedRequest.instance(retryConfig);
      return response;

    } catch (error) {
      if (error.response?.status === 401) {
        this.handlePersistentAuthError();
      }

      throw error;
    }
  }

  /**
   * Handle the token refresh process with queuing.
   * If a refresh is already in progress, the failed request is queued
   * and a Promise is returned that resolves when the ongoing refresh completes.
   */
  async handleTokenRefresh(failedRequest) {
    if (!failedRequest?.config || !failedRequest?.instance) {
      throw new Error('Invalid failed request object');
    }

    // If already refreshing, queue the request and wait for the ongoing refresh
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.addToQueue({ ...failedRequest, resolve, reject });
      });
    }

    // Start the refresh process
    this.isRefreshing = true;
    this.addToQueue(failedRequest);

    try {
      // Call auth service directly (no intermediary)
      // Backend sets new cookies automatically via withCredentials
      await authService.refreshToken();

      // Process all queued requests
      await this.processQueue();

      this.isRefreshing = false;
      return true;

    } catch (error) {
      this.isRefreshing = false;
      this.retryAttempts++;

      // If max retries exceeded, clear queue and logout
      if (this.retryAttempts >= this.maxRetries) {
        this.handleAuthFailure();
      }

      // Reject all pending requests
      this.rejectPendingRequests(error);
      throw error;
    }
  }

  /**
   * Reject all pending requests with an error
   */
  rejectPendingRequests(error) {
    this.pendingRequests.forEach(request => {
      if (request.reject) {
        request.reject(error);
      }
    });

    this.pendingRequests = [];
  }

  /**
   * Handle complete auth failure — SINGLE SOURCE OF TRUTH
   * Called when refresh attempts are exhausted or persistent 401s occur.
   */
  handleAuthFailure() {
    // Single source of truth for session cleanup + redirect
    tokenManager.handleSessionExpired();

    // Clear queue state
    this.clearQueue();
  }

  /**
   * Handle persistent authentication errors (e.g., retry also returns 401)
   */
  handlePersistentAuthError() {
    this.handleAuthFailure();
  }

  /**
   * Log retry results for monitoring and debugging
   */
  logRetryResults(results) {
    const failed = results.filter(r => r.status === 'rejected').length;

    if (failed > 0 && process.env.NODE_ENV === 'development') {
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          // Development-only logging
          // eslint-disable-next-line no-console
          console.warn(`RefreshQueue: Request ${index} retry failed:`, result.reason);
        }
      });
    }
  }

  /**
   * Get queue status for debugging and monitoring
   */
  getQueueStatus() {
    return {
      isRefreshing: this.isRefreshing,
      pendingRequests: this.pendingRequests.length,
      retryAttempts: this.retryAttempts,
      maxQueueSize: this.maxQueueSize
    };
  }

  /**
   * Clear the queue (useful for logout)
   */
  clearQueue() {
    this.pendingRequests = [];
    this.isRefreshing = false;
    this.retryAttempts = 0;
  }

  /**
   * Check if queue is active (for UI indicators)
   */
  isQueueActive() {
    return this.isRefreshing || this.pendingRequests.length > 0;
  }
}

// Singleton instance
export const refreshQueue = new RefreshQueue();
export default refreshQueue;