// 🎯 How to Use Each Module:
// 1. Using API_CONFIG in Components:

// frontend/src/components/UserProfile.jsx
import { getErrorMessage, HTTP_STATUS } from '@/lib/config/api-config';

function UserProfile() {
  const handleError = (error) => {
    // Use centralized error messages
    const message = getErrorMessage(error);
    showToast(message);

    // Use HTTP status constants
    if (error.status === HTTP_STATUS.UNAUTHORIZED) {
      redirectToLogin();
    }
  };
}
// 2. Using Clients in Services:

// // frontend/src/services/domain/admin-service.js
import { privateClient } from '@/services/api/client';
import { adminEndpoints } from '@/services/api/endpoints/admin-endpoints';

class AdminService {
  async getUsers(filters = {}) {
    const url = adminEndpoints.withFilters(
      adminEndpoints.withPagination(adminEndpoints.USERS, 1, 50),
      filters
    );

    return await privateClient.securedGet(url);
  }
}
// 3. Using Services in React Components:
// javascript
// // frontend/src/components/LoginForm.jsx
// import { authService } from '@/services/domain/auth-service';
// import { notificationService } from '@/services/domain/notification-service';

// function LoginForm() {
//   const handleLogin = async (credentials) => {
//     try {
//       const result = await authService.login(credentials);
//       await notificationService.success('Welcome!', 'Login successful');
//       return result;
//     } catch (error) {
//       await notificationService.error('Login Failed', error.message);
//     }
//   };
// }
// 4. Using Refresh Queue(Automatic):
// javascript
// // The refresh queue works automatically through PrivateClient
// // No manual usage needed - it handles token refresh automatically

// // But you can check status for debugging:
// import refreshQueue from '@/services/api/refresh-queue';

// // Debug queue status
// console.log('Queue status:', refreshQueue.getQueueStatus());
// 🚀 Complete Usage Examples:
// Authentication Flow:
// javascript
// // frontend/src/hooks/useAuth.js
// import { authService } from '@/services/domain/auth-service';
// import { getErrorMessage } from '@/lib/config/api-config';

// export function useAuth() {
//   const login = async (credentials) => {
//     try {
//       const result = await authService.login(credentials);
//       return result;
//     } catch (error) {
//       throw new Error(getErrorMessage(error));
//     }
//   };

//   const logout = async () => {
//     await authService.logout();
//   };

//   return { login, logout };
// }
// User Profile Management:
// javascript
// // frontend/src/hooks/useUserProfile.js
// import { userService } from '@/services/domain/user-service';

// export function useUserProfile() {
//   const getProfile = async () => {
//     return await userService.getProfile({ useCache: true });
//   };

//   const updateProfile = async (profileData) => {
//     return await userService.updateProfile(profileData);
//   };

//   const uploadAvatar = async (file, onProgress) => {
//     return await userService.uploadAvatar(file, onProgress);
//   };

//   return { getProfile, updateProfile, uploadAvatar };
// }
// Admin Operations:
// javascript
// // frontend/src/hooks/useAdmin.js
// import { privateClient } from '@/services/api/client';
// import { adminEndpoints } from '@/services/api/endpoints/admin-endpoints';

// export function useAdmin() {
//   const suspendUser = async (userId, reason) => {
//     const url = adminEndpoints.USER_SUSPEND(userId);
//     return await privateClient.securedPost(url, { reason });
//   };

//   const getAnalytics = async (startDate, endDate) => {
//     const url = adminEndpoints.withDateRange(
//       adminEndpoints.ANALYTICS_USERS,
//       startDate,
//       endDate
//     );
//     return await privateClient.securedGet(url);
//   };

//   return { suspendUser, getAnalytics };
// }
// 🔄 Module Integration Flow:
// Complete Request Journey:
// text
// Component → Service → Endpoint → Client → API_CONFIG → Backend
//     ↓
// Response → Client → Service → Component
//     ↓
// 401 Error → Refresh Queue → New Token → Retry Request
// Error Handling Flow:
// text
// Error → BaseClient.normalizeError() → getErrorMessage() → User - friendly message
// 📋 Quick Reference Import Map:
// javascript
// // Configuration
// import { API_CONFIG, getErrorMessage, HTTP_STATUS } from '@/lib/config/api-config';

// // Clients
// import { privateClient, publicClient } from '@/services/api/client';

// // Endpoints  
// import { authEndpoints, userEndpoints, adminEndpoints } from '@/services/api/endpoints';

// // Services
// import { authService, userService } from '@/services/domain';
// import { notificationService } from '@/services/domain/notification-service';

// // Refresh Queue (mostly automatic)
// import refreshQueue from '@/services/api/refresh-queue';