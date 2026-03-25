// frontend/src/services/ui/index.js

/**
 * UI Orchestration Services
 * These services manage UI state through Redux dispatch.
 * They are NOT domain/business logic — they exist to orchestrate
 * UI concerns like toasts, notifications, and layout state.
 *
 * Domain services (auth-service, user-service) live in services/domain/
 * and must NOT dispatch Redux actions.
 */

export { default as toastService } from "./toast-service";
export { default as uiService } from "./ui-service";
export { default as notificationService } from "./notification-service";
export { default as activityService } from "./activity-service";
