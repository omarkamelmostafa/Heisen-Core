import { authService } from '@/services/domain/auth-service';
import StoreAccessor from '@/store/store-accessor';
import { logout } from '@/store/slices/auth/auth-slice';

/**
 * Refresh Queue Manager
 * Sole orchestrator for token refresh lifecycle.
 * Handles concurrent token refresh scenarios and request queuing.
 * Prevents multiple refresh token calls when multiple requests fail simultaneously.
 *
 * Flow:
 *   PrivateClient 401 interceptor
 *     → refreshQueue.handleTokenRefresh()
 *       → authService.refreshToken()             (HTTP call, backend sets cookies)
 *       → processQueue() → retry all queued requests (cookies sent automatically)
 */
class RefreshQueue {
  constructor() {
    this.isRefreshing = false;
    this.pendingRequests = [];
    this.maxQueueSize = 50; // Prevent memory leaks
    this.retryAttempts = 0;
    this.maxRetries = 3;
  }

  /**
   * Add a failed request to the queue for retry after token refresh
   */
  addToQueue(failedRequest) {
    if (this.pendingRequests.length >= this.maxQueueSize) {
      console.warn('RefreshQueue: Queue limit reached, clearing oldest requests');
      this.pendingRequests = this.pendingRequests.slice(-this.maxQueueSize / 2);
    }

    this.pendingRequests.push(failedRequest);
    console.log(`RefreshQueue: Added request to queue. Queue size: ${this.pendingRequests.length}`);
  }

  /**
   * Process all pending requests after successful token refresh
   */
  async processQueue() {
    if (this.pendingRequests.length === 0) {
      console.log('RefreshQueue: No pending requests to process');
      return;
    }

    console.log(`RefreshQueue: Processing ${this.pendingRequests.length} pending requests`);

    // Create a copy and clear the original queue immediately
    const requestsToProcess = [...this.pendingRequests];
    this.pendingRequests = [];
    this.retryAttempts = 0; // Reset retry counter on success

    // Process all queued requests with the new token
    const results = await Promise.allSettled(
      requestsToProcess.map(request => this.retryRequest(request))
    );

    // Log results for monitoring
    this.logRetryResults(results);
  }

  /**
   * Retry a single failed request with the new token
   */
  async retryRequest(failedRequest) {
    try {
      const retryConfig = {
        ...failedRequest.config,
        __isRetry: true // Mark as retry to prevent infinite loops
      };

      console.log(`RefreshQueue: Retrying ${retryConfig.method?.toUpperCase()} ${retryConfig.url}`);

      // Use the original axios instance to retry
      const response = await failedRequest.instance(retryConfig);

      console.log(`RefreshQueue: Retry successful for ${retryConfig.url}`);
      return response;

    } catch (error) {
      console.error(`RefreshQueue: Retry failed for ${failedRequest.config.url}`, error);

      // If retry also fails with auth error, we might need to logout
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
      console.log('RefreshQueue: Starting token refresh process');

      // Call auth service (no tokens passed, browser sends cookies)
      const response = await authService.refreshToken();
      const userData = response.data.user;

      // Sync Redux auth state if user data is returned
      // if (userData) StoreAccessor.dispatch(setUserInfo(userData));

      console.log('RefreshQueue: Token refresh successful, processing queue');

      // Process all queued requests (automatic cookie handling)
      await this.processQueue();

      this.isRefreshing = false;
      return true;

    } catch (error) {
      console.error('RefreshQueue: Token refresh failed', error);

      this.isRefreshing = false;
      this.retryAttempts++;

      // If max retries exceeded, clear queue and logout
      if (this.retryAttempts >= this.maxRetries) {
        await this.handleRefreshFailure();
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
    console.log(`RefreshQueue: Rejecting ${this.pendingRequests.length} pending requests`);

    this.pendingRequests.forEach(request => {
      if (request.reject) {
        request.reject(error);
      }
    });

    this.pendingRequests = [];
  }

  /**
   * Handle complete refresh failure (logout user)
   */
  async handleRefreshFailure() {
    console.error('RefreshQueue: Maximum retry attempts exceeded, logging out user');

    // Clear Redux auth state
    StoreAccessor.dispatch(logout());

    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login?session=expired';
    }
  }

  /**
   * Handle persistent authentication errors (logout required)
   */
  handlePersistentAuthError() {
    console.error('RefreshQueue: Persistent auth error detected');
    this.handleRefreshFailure();
  }

  /**
   * Log retry results for monitoring and debugging
   */
  logRetryResults(results) {
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`RefreshQueue: Retry results - ${successful} successful, ${failed} failed`);

    if (failed > 0) {
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`RefreshQueue: Request ${index} failed:`, result.reason);
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
    console.log('RefreshQueue: Clearing all pending requests');
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