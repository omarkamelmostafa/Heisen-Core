// frontend/src/services/api/interceptors/error-interceptor.js
import { HTTP_STATUS } from '@/lib/config/api-config';
import { store } from '@/store';
import { showNotification } from '@/store/slices/ui/ui-slice';

export const errorInterceptor = (error) => {
  const { response, config } = error;
  
  // Don't show notifications for certain endpoints
  if (this.shouldSuppressError(config?.url)) {
    return Promise.reject(error);
  }

  // Handle different error types
  if (!response) {
    // Network error
    store.dispatch(showNotification({
      type: 'error',
      title: 'Network Error',
      message: 'Please check your internet connection',
    }));
  } else {
    // Server error with status code
    this.handleServerError(response);
  }

  return Promise.reject(error);
};

// Handle different server error statuses
handleServerError(response) {
  const { status, data } = response;
  
  switch (status) {
    case HTTP_STATUS.UNAUTHORIZED:
      // Handled by auth interceptor
      break;
      
    case HTTP_STATUS.FORBIDDEN:
      store.dispatch(showNotification({
        type: 'error',
        title: 'Access Denied',
        message: data?.message || 'You do not have permission for this action',
      }));
      break;
      
    case HTTP_STATUS.NOT_FOUND:
      store.dispatch(showNotification({
        type: 'warning',
        title: 'Not Found',
        message: data?.message || 'The requested resource was not found',
      }));
      break;
      
    case HTTP_STATUS.TOO_MANY_REQUESTS:
      store.dispatch(showNotification({
        type: 'warning',
        title: 'Too Many Requests',
        message: data?.message || 'Please slow down and try again later',
      }));
      break;
      
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      store.dispatch(showNotification({
        type: 'error',
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.',
      }));
      break;
      
    default:
      store.dispatch(showNotification({
        type: 'error',
        title: 'Error',
        message: data?.message || 'Something went wrong',
      }));
  }
}

// Suppress errors for certain endpoints
shouldSuppressError(url) {
  const suppressedEndpoints = [
    '/auth/refresh',
    '/auth/logout',
    '/monitoring/',
  ];
  
  return suppressedEndpoints.some(endpoint => url?.includes(endpoint));
}

export default errorInterceptor;