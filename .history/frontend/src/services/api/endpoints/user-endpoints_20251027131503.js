// frontend/src/services/api/endpoints/user-endpoints.js
// User management API endpoints
class UserEndpoints {
  constructor() {
    this.BASE = "/users";
    this.VERSION = "/v1";
    this.PREFIX = `${this.BASE}${this.VERSION}`;
    this.ADMIN_PREFIX = `${this.BASE}${this.VERSION}/admin`;
  }

  // Profile endpoints
  get PROFILE() {
    return `${this.PREFIX}/profile`;
  }

  get UPDATE_PROFILE() {
    return `${this.PREFIX}/profile`;
  }

  get UPLOAD_AVATAR() {
    return `${this.PREFIX}/profile/avatar`;
  }

  // Preferences endpoints
  get PREFERENCES() {
    return `${this.PREFIX}/preferences`;
  }

  // Security endpoints
  get CHANGE_PASSWORD() {
    return `${this.PREFIX}/security/password`;
  }

  get UPDATE_EMAIL() {
    return `${this.PREFIX}/security/email`;
  }

  get DELETE_ACCOUNT() {
    return `${this.PREFIX}/security/account`;
  }

  // Session management
  get SESSIONS() {
    return `${this.PREFIX}/sessions`;
  }

  get SESSION() {
    return (sessionId) => `${this.SESSIONS}/${sessionId}`;
  }

  // Security logs
  get SECURITY_LOGS() {
    return `${this.PREFIX}/security/logs`;
  }

  // Admin endpoints
  get ADMIN_USERS() {
    return `${this.ADMIN_PREFIX}/users`;
  }

  get ADMIN_USER() {
    return (userId) => `${this.ADMIN_USERS}/${userId}`;
  }

  get ADMIN_USER_SUSPEND() {
    return (userId) => `${this.ADMIN_USER(userId)}/suspend`;
  }

  // Query parameter helpers
  withPagination(url, page = 1, limit = 10) {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    return `${url}?${params.toString()}`;
  }

  withFilters(url, filters = {}) {
    if (Object.keys(filters).length === 0) return url;

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, value.toString());
      }
    });

    return `${url}?${params.toString()}`;
  }
}


🚀 USAGE EXAMPLES:
// Singleton instance
export const userEndpoints = new UserEndpoints();
export default userEndpoints;


// In your components or thunks
import { userService } from '@/services/domain/user-service';

// Get user profile
const profile = await userService.getProfile();

// Update profile
await userService.updateProfile({ name: 'John Doe' });

// Change password
await userService.changePassword({
  currentPassword: 'oldPass123',
  newPassword: 'newPass456'
});

// Admin: Get all users
const users = await userService.getAllUsers(
  { role: 'user', status: 'active' }, 
  1, 
  20
);