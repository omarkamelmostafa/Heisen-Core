# Frontend Usage Examples

This guide provides practical examples on how to use the core services and configurations within the application.

## 1. Using API Configuration
Access error messages and HTTP status codes consistently.

```javascript
import { getErrorMessage, HTTP_STATUS } from '@/lib/config/api-config';

function MyComponent() {
  const handleError = (error) => {
    const message = getErrorMessage(error);
    // Display error message...
    
    if (error.status === HTTP_STATUS.UNAUTHORIZED) {
      // Redirect to login...
    }
  };
}
```

## 2. Service-to-Service Interaction
Use the `privateClient` for secured requests within domain services.

```javascript
import { privateClient } from '@/services/api/client';
import { adminEndpoints } from '@/services/api/endpoints';

class AdminService {
  async getUsers(filters = {}) {
    const url = adminEndpoints.withFilters(adminEndpoints.USERS, filters);
    return await privateClient.securedGet(url);
  }
}
```

## 3. UI Component Integration
Interact with domain services directly for business logic and notifications.

```javascript
import { authService } from '@/services/domain';
import { notificationService } from '@/services/domain/notification-service';

function LoginForm() {
  const handleLogin = async (credentials) => {
    try {
      const result = await authService.login(credentials);
      await notificationService.success('Welcome!', 'Login successful');
      return result;
    } catch (error) {
      await notificationService.error('Login Failed', error.message);
    }
  };
}
```

## 4. Token Refresh (Automatic)
The `privateClient` handles token refresh automatically via `RefreshQueue`. No manual intervention is required.

---

## 5. Quick Reference Import Map

| Asset | Path |
|---|---|
| API Config | `@/lib/config/api-config` |
| Clients | `@/services/api/client` |
| Endpoints | `@/services/api/endpoints` |
| Services | `@/services/domain` |
