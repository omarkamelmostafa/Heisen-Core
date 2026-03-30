// frontend/audit-report.md
# Frontend Architecture Validation Audit

## Step 1: Map Current File Tree

- src/app/(auth)/auth-layout-wrapper.jsx
- src/app/(auth)/forgot-password/loading.jsx
- src/app/(auth)/forgot-password/page.jsx
- src/app/(auth)/layout.jsx
- src/app/(auth)/loading.jsx
- src/app/(auth)/login/loading.jsx
- src/app/(auth)/login/page.jsx
- src/app/(auth)/reset-password/loading.jsx
- src/app/(auth)/reset-password/page.jsx
- src/app/(auth)/signup/loading.jsx
- src/app/(auth)/signup/page.jsx
- src/app/(auth)/verify-email/loading.jsx
- src/app/(auth)/verify-email/page.jsx
- src/app/dashboard/page.jsx
- src/app/error.jsx
- src/app/global-error.jsx
- src/app/layout.jsx
- src/app/loading.jsx
- src/app/not-found.jsx
- src/app/page.jsx
- src/components/auth/auth-bootstrap.jsx
- src/components/auth/error/dev-error-toggle.jsx
- src/components/auth/error/dev-wrapper.jsx
- src/components/auth/error/error-simulator.jsx
- src/components/auth/error/production-error-trigger.jsx
- src/components/auth/forgot-password/back-to-login-link.jsx
- src/components/auth/forgot-password/forgot-password-header.jsx
- src/components/auth/forgot-password/form-header.jsx
- src/components/auth/forgot-password/form-state.jsx
- src/components/auth/forgot-password/help-text.jsx
- src/components/auth/forgot-password/reset-password-form.jsx
- src/components/auth/forgot-password/success-actions.jsx
- src/components/auth/forgot-password/success-icon.jsx
- src/components/auth/forgot-password/success-message.jsx
- src/components/auth/forgot-password/success-state.jsx
- src/components/auth/forgot-password/troubleshooting-tips.jsx
- src/components/auth/forms/auth-error-alert.jsx
- src/components/auth/forms/auth-form-provider.jsx
- src/components/auth/forms/auth-submit-button.jsx
- src/components/auth/forms/form-field.jsx
- src/components/auth/guards/protected-guard.jsx
- src/components/auth/guards/public-guard.jsx
- src/components/auth/login/divider.jsx
- src/components/auth/login/login-form.jsx
- src/components/auth/login/login-header.jsx
- src/components/auth/login/login-options.jsx
- src/components/auth/login/welcome-section.jsx
- src/components/auth/panels/auth-right-panel.jsx
- src/components/auth/panels/background-decoration.jsx
- src/components/auth/panels/content-card.jsx
- src/components/auth/panels/header-section.jsx
- src/components/auth/panels/index.jsx
- src/components/auth/providers/auth-providers.jsx
- src/components/auth/reset-password/back-to-login-link.jsx
- src/components/auth/reset-password/form-header.jsx
- src/components/auth/reset-password/form-state.jsx
- src/components/auth/reset-password/help-text.jsx
- src/components/auth/reset-password/password-requirements.jsx
- src/components/auth/reset-password/reset-password-form.jsx
- src/components/auth/reset-password/reset-password-header.jsx
- src/components/auth/reset-password/security-tips.jsx
- src/components/auth/reset-password/success-actions.jsx
- src/components/auth/reset-password/success-icon.jsx
- src/components/auth/reset-password/success-message.jsx
- src/components/auth/reset-password/success-state.jsx
- src/components/auth/shared/password-match-indicator.jsx
- src/components/auth/shared/password-strength-meter.jsx
- src/components/auth/signup/name-fields.jsx
- src/components/auth/signup/password-fields.jsx
- src/components/auth/signup/signup-form.jsx
- src/components/auth/signup/signup-header.jsx
- src/components/auth/signup/signup-options.jsx
- src/components/auth/signup/terms-and-conditions.jsx
- src/components/auth/signup/welcome-section.jsx
- src/components/auth/verify-email/back-to-login-link.jsx
- src/components/auth/verify-email/help-text.jsx
- src/components/auth/verify-email/resend-code-section.jsx
- src/components/auth/verify-email/success-state.jsx
- src/components/auth/verify-email/timer-display.jsx
- src/components/auth/verify-email/verification-form.jsx
- src/components/auth/verify-email/verification-input.jsx
- src/components/auth/verify-email/verify-email-header.jsx
- src/components/auth/verify-email/welcome-section.jsx
- src/components/shared/error-boundary.jsx
- src/components/shared/error-fallback.jsx
- src/components/ui/animated-logo.jsx
- src/components/ui/button.jsx
- src/components/ui/card.jsx
- src/components/ui/checkbox.jsx
- src/components/ui/fantasy-loader.jsx
- src/components/ui/input.jsx
- src/components/ui/label.jsx
- src/components/ui/letters-pull-up.jsx
- src/components/ui/logo.jsx
- src/components/ui/skeleton.jsx
- src/components/utils/error-handler.jsx
- src/hooks/environment-debug.jsx
- src/hooks/redux.js
- src/hooks/use-error-toggle.js
- src/hooks/use-loading-simulator.js
- src/lib/animations/auth/authAnimations.js
- src/lib/config/api-config.js
- src/lib/config/auth/forgot-password.js
- src/lib/config/auth/login.js
- src/lib/config/auth/reset-password.js
- src/lib/config/auth/signup.js
- src/lib/config/auth/verify-email.js
- src/lib/config/route-config.js
- src/lib/environment.js
- src/lib/utils/error-utils.js
- src/lib/utils/modal-callback-registry.js
- src/lib/utils.js
- src/lib/validations/auth-schemas.js
- src/middleware.js
- src/providers/store-provider.jsx
- src/services/api/client/base-client.js
- src/services/api/client/How-To-Use.js
- src/services/api/client/index.js
- src/services/api/client/private-client.js
- src/services/api/client/public-client.js
- src/services/api/endpoints/admin-endpoints.js
- src/services/api/endpoints/auth-endpoints.js
- src/services/api/endpoints/index.js
- src/services/api/endpoints/user-endpoints.js
- src/services/api/refresh-queue.js
- src/services/auth/token-manager.js
- src/services/domain/auth-service.js
- src/services/domain/user-service.js
- src/services/storage/cookie-service.js
- src/services/storage/storage-constants.js
- src/services/ui/activity-service.js
- src/services/ui/index.js
- src/services/ui/notification-service.js
- src/services/ui/toast-service.js
- src/services/ui/ui-service.js
- src/store/index.js
- src/store/root-actions.js
- src/store/root-reducer.js
- src/store/slices/auth/auth-selectors.js
- src/store/slices/auth/auth-slice.js
- src/store/slices/auth/auth-thunks.js
- src/store/slices/auth/index.js
- src/store/slices/notifications/index.js
- src/store/slices/notifications/notifications-slice.js
- src/store/slices/ui/confirmation/confirmation-selectors.js
- src/store/slices/ui/confirmation/confirmation-slice.js
- src/store/slices/ui/errors/errors-selectors.js
- src/store/slices/ui/errors/errors-slice.js
- src/store/slices/ui/form/form-selectors.js
- src/store/slices/ui/form/form-slice.js
- src/store/slices/ui/index.js
- src/store/slices/ui/layout/layout-selectors.js
- src/store/slices/ui/layout/layout-slice.js
- src/store/slices/ui/loading/loading-selectors.js
- src/store/slices/ui/loading/loading-slice.js
- src/store/slices/ui/modal/modal-selectors.js
- src/store/slices/ui/modal/modal-slice.js
- src/store/slices/ui/navigation/navigation-selectors.js
- src/store/slices/ui/navigation/navigation-slice.js
- src/store/slices/ui/notification/notification-selectors.js
- src/store/slices/ui/notification/notification-slice.js
- src/store/slices/ui/pagination/pagination-selectors.js
- src/store/slices/ui/pagination/pagination-slice.js
- src/store/slices/ui/performance/performance-selectors.js
- src/store/slices/ui/performance/performance-slice.js
- src/store/slices/ui/scroll/scroll-selectors.js
- src/store/slices/ui/scroll/scroll-slice.js
- src/store/slices/ui/search/search-selectors.js
- src/store/slices/ui/search/search-slice.js
- src/store/slices/ui/theme/theme-selectors.js
- src/store/slices/ui/theme/theme-slice.js
- src/store/slices/ui/ui-selectors.js
- src/store/slices/ui/ui-thunks.js
- src/store/slices/user/index.js
- src/store/slices/user/user-selectors.js
- src/store/slices/user/user-slice.js
- src/store/slices/user/user-thunks.js
- src/store/store-accessor.js
- src/store/utils/thunk-utils.js

## Step 2: Classify Every Component

| File | Has useDispatch? | Has useSelector? | Has API calls? | Has useRouter? | Has business logic? | Classification |
|------|-----------------|-----------------|----------------|---------------|--------------------|---------------|
| auth-layout-wrapper.jsx | NO | NO | NO | YES | NO | SMART |
| loading.jsx | NO | NO | NO | NO | NO | PAGE |
| page.jsx | YES | YES | NO | NO | YES | PAGE |
| layout.jsx | NO | NO | NO | NO | NO | PAGE |
| loading.jsx | NO | NO | NO | NO | NO | PAGE |
| loading.jsx | NO | NO | NO | NO | NO | PAGE |
| page.jsx | YES | YES | NO | YES | YES | PAGE |
| loading.jsx | NO | NO | NO | NO | NO | PAGE |
| page.jsx | YES | YES | NO | YES | YES | PAGE |
| loading.jsx | NO | NO | NO | NO | NO | PAGE |
| page.jsx | YES | YES | NO | YES | YES | PAGE |
| loading.jsx | NO | NO | NO | NO | NO | PAGE |
| page.jsx | YES | YES | NO | YES | YES | PAGE |
| page.jsx | YES | YES | YES | YES | NO | PAGE |
| error.jsx | NO | NO | NO | NO | NO | PAGE |
| global-error.jsx | NO | NO | NO | NO | NO | PAGE |
| layout.jsx | NO | NO | NO | NO | NO | PAGE |
| loading.jsx | NO | NO | NO | NO | NO | PAGE |
| not-found.jsx | NO | NO | NO | NO | NO | DUMB |
| page.jsx | NO | NO | NO | NO | NO | PAGE |
| auth-bootstrap.jsx | YES | NO | YES | NO | YES | SMART |
| dev-error-toggle.jsx | NO | NO | NO | NO | NO | DUMB |
| dev-wrapper.jsx | NO | NO | NO | NO | NO | DUMB |
| error-simulator.jsx | NO | NO | NO | NO | NO | DUMB |
| production-error-trigger.jsx | NO | NO | NO | NO | NO | DUMB |
| back-to-login-link.jsx | NO | NO | NO | NO | NO | DUMB |
| forgot-password-header.jsx | NO | NO | NO | NO | NO | DUMB |
| form-header.jsx | NO | NO | NO | NO | NO | DUMB |
| form-state.jsx | NO | NO | NO | NO | NO | DUMB |
| help-text.jsx | NO | NO | NO | NO | NO | DUMB |
| reset-password-form.jsx | NO | NO | NO | NO | NO | DUMB |
| success-actions.jsx | NO | NO | NO | NO | NO | DUMB |
| success-icon.jsx | NO | NO | NO | NO | NO | DUMB |
| success-message.jsx | NO | NO | NO | NO | NO | DUMB |
| success-state.jsx | NO | NO | NO | NO | NO | DUMB |
| troubleshooting-tips.jsx | NO | NO | NO | NO | NO | DUMB |
| auth-error-alert.jsx | NO | YES | NO | NO | NO | SMART |
| auth-form-provider.jsx | NO | NO | NO | NO | NO | DUMB |
| auth-submit-button.jsx | NO | NO | NO | NO | NO | DUMB |
| form-field.jsx | NO | NO | NO | NO | NO | DUMB |
| protected-guard.jsx | NO | YES | NO | YES | YES | SMART |
| public-guard.jsx | NO | YES | NO | YES | YES | SMART |
| divider.jsx | NO | NO | NO | NO | NO | DUMB |
| login-form.jsx | NO | NO | NO | NO | NO | DUMB |
| login-header.jsx | NO | NO | NO | NO | NO | DUMB |
| login-options.jsx | NO | NO | NO | NO | NO | DUMB |
| welcome-section.jsx | NO | NO | NO | NO | NO | DUMB |
| auth-right-panel.jsx | NO | NO | NO | NO | NO | DUMB |
| background-decoration.jsx | NO | NO | NO | NO | NO | DUMB |
| content-card.jsx | NO | NO | NO | NO | NO | DUMB |
| header-section.jsx | NO | NO | NO | NO | NO | DUMB |
| index.jsx | NO | NO | NO | NO | NO | DUMB |
| auth-providers.jsx | NO | NO | NO | NO | NO | DUMB |
| back-to-login-link.jsx | NO | NO | NO | NO | NO | DUMB |
| form-header.jsx | NO | NO | NO | NO | NO | DUMB |
| form-state.jsx | NO | NO | NO | NO | NO | DUMB |
| help-text.jsx | NO | NO | NO | NO | NO | DUMB |
| password-requirements.jsx | NO | NO | NO | NO | NO | DUMB |
| reset-password-form.jsx | NO | NO | NO | NO | NO | DUMB |
| reset-password-header.jsx | NO | NO | NO | NO | NO | DUMB |
| security-tips.jsx | NO | NO | NO | NO | NO | DUMB |
| success-actions.jsx | NO | NO | NO | NO | NO | DUMB |
| success-icon.jsx | NO | NO | NO | NO | NO | DUMB |
| success-message.jsx | NO | NO | NO | NO | NO | DUMB |
| success-state.jsx | NO | NO | NO | NO | NO | DUMB |
| password-match-indicator.jsx | NO | NO | NO | NO | NO | DUMB |
| password-strength-meter.jsx | NO | NO | NO | NO | NO | DUMB |
| name-fields.jsx | NO | NO | NO | NO | NO | DUMB |
| password-fields.jsx | NO | NO | NO | NO | NO | DUMB |
| signup-form.jsx | NO | NO | NO | NO | NO | DUMB |
| signup-header.jsx | NO | NO | NO | NO | NO | DUMB |
| signup-options.jsx | NO | NO | NO | NO | NO | DUMB |
| terms-and-conditions.jsx | NO | NO | NO | NO | NO | DUMB |
| welcome-section.jsx | NO | NO | NO | NO | NO | DUMB |
| back-to-login-link.jsx | NO | NO | NO | NO | NO | DUMB |
| help-text.jsx | NO | NO | NO | NO | NO | DUMB |
| resend-code-section.jsx | NO | NO | NO | NO | NO | DUMB |
| success-state.jsx | NO | NO | NO | NO | NO | DUMB |
| timer-display.jsx | NO | NO | NO | NO | NO | DUMB |
| verification-form.jsx | NO | NO | NO | NO | NO | DUMB |
| verification-input.jsx | NO | NO | NO | NO | NO | DUMB |
| verify-email-header.jsx | NO | NO | NO | NO | NO | DUMB |
| welcome-section.jsx | NO | NO | NO | NO | NO | DUMB |
| error-boundary.jsx | NO | NO | NO | NO | NO | DUMB |
| error-fallback.jsx | NO | NO | NO | NO | NO | DUMB |
| animated-logo.jsx | NO | NO | NO | NO | NO | DUMB |
| button.jsx | NO | NO | NO | NO | NO | DUMB |
| card.jsx | NO | NO | NO | NO | NO | DUMB |
| checkbox.jsx | NO | NO | NO | NO | NO | DUMB |
| fantasy-loader.jsx | NO | NO | NO | NO | NO | DUMB |
| input.jsx | NO | NO | NO | NO | NO | DUMB |
| label.jsx | NO | NO | NO | NO | NO | DUMB |
| letters-pull-up.jsx | NO | NO | NO | NO | NO | DUMB |
| logo.jsx | NO | NO | NO | NO | NO | DUMB |
| skeleton.jsx | NO | NO | NO | NO | NO | DUMB |
| error-handler.jsx | NO | NO | NO | NO | NO | DUMB |
| environment-debug.jsx | NO | NO | NO | NO | NO | DUMB |
| store-provider.jsx | NO | NO | NO | NO | NO | DUMB |
| How-To-Use.js | NO | NO | NO | NO | NO | DUMB |

## Step 3: Identify Violations

| File | Current Classification | Violation | What Needs To Move |
|------|----------------------|-----------|-------------------|
| auth-layout-wrapper.jsx (src/app/(auth)/auth-layout-wrapper.jsx) | SMART | Routing logic in component | Extract logic to hook |
| page.jsx (src/app/(auth)/forgot-password/page.jsx) | PAGE | Redux dispatch in component, Redux selector in component, Business logic in component | Extract logic to hook |
| page.jsx (src/app/(auth)/login/page.jsx) | PAGE | Redux dispatch in component, Redux selector in component, Routing logic in component, Business logic in component | Extract logic to hook |
| page.jsx (src/app/(auth)/reset-password/page.jsx) | PAGE | Redux dispatch in component, Redux selector in component, Routing logic in component, Business logic in component | Extract logic to hook |
| page.jsx (src/app/(auth)/signup/page.jsx) | PAGE | Redux dispatch in component, Redux selector in component, Routing logic in component, Business logic in component | Extract logic to hook |
| page.jsx (src/app/(auth)/verify-email/page.jsx) | PAGE | Redux dispatch in component, Redux selector in component, Routing logic in component, Business logic in component | Extract logic to hook |
| page.jsx (src/app/dashboard/page.jsx) | PAGE | Redux dispatch in component, Redux selector in component, API calls in component, Routing logic in component | Extract logic to hook |
| auth-bootstrap.jsx (src/components/auth/auth-bootstrap.jsx) | SMART | Redux dispatch in component, API calls in component, Business logic in component | Extract logic to hook |
| auth-error-alert.jsx (src/components/auth/forms/auth-error-alert.jsx) | SMART | Redux selector in component | Pass error via props |
| protected-guard.jsx (src/components/auth/guards/protected-guard.jsx) | SMART | Redux selector in component, Routing logic in component, Business logic in component | Extract logic to hook |
| public-guard.jsx (src/components/auth/guards/public-guard.jsx) | SMART | Redux selector in component, Routing logic in component, Business logic in component | Extract logic to hook |

## Step 4: Identify Missing Hooks

| Hook Name | Logic To Extract From | What It Will Contain |
|-----------|----------------------|---------------------|
| useAuthRouting | auth-layout-wrapper.jsx | Routing logic in component |
| useForgotPassword | page.jsx | Redux dispatch in component, Redux selector in component, Business logic in component |
| useLogin | page.jsx | Redux dispatch in component, Redux selector in component, Routing logic in component, Business logic in component |
| useResetPassword | page.jsx | Redux dispatch in component, Redux selector in component, Routing logic in component, Business logic in component |
| useSignup | page.jsx | Redux dispatch in component, Redux selector in component, Routing logic in component, Business logic in component |
| useVerifyEmail | page.jsx | Redux dispatch in component, Redux selector in component, Routing logic in component, Business logic in component |
| useDashboard | page.jsx | Redux dispatch in component, Redux selector in component, API calls in component, Routing logic in component |
| useAuthBootstrap | auth-bootstrap.jsx | Redux dispatch in component, API calls in component, Business logic in component |
| useAuthGuard | protected-guard.jsx, public-guard.jsx | Redux selector in component, Routing logic in component, Business logic in component |

## Step 5: Propose File Moves

| Current Path | Target Path | Action |
|-------------|------------|--------|
| src/components/auth/auth-bootstrap.jsx | src/features/auth/components/auth-bootstrap.jsx | Move |
| src/components/auth/error/dev-error-toggle.jsx | src/features/auth/components/error/dev-error-toggle.jsx | Move |
| src/components/auth/error/dev-wrapper.jsx | src/features/auth/components/error/dev-wrapper.jsx | Move |
| src/components/auth/error/error-simulator.jsx | src/features/auth/components/error/error-simulator.jsx | Move |
| src/components/auth/error/production-error-trigger.jsx | src/features/auth/components/error/production-error-trigger.jsx | Move |
| src/components/auth/forgot-password/back-to-login-link.jsx | src/features/auth/components/forgot-password/back-to-login-link.jsx | Move |
| src/components/auth/forgot-password/forgot-password-header.jsx | src/features/auth/components/forgot-password/forgot-password-header.jsx | Move |
| src/components/auth/forgot-password/form-header.jsx | src/features/auth/components/forgot-password/form-header.jsx | Move |
| src/components/auth/forgot-password/form-state.jsx | src/features/auth/components/forgot-password/form-state.jsx | Move |
| src/components/auth/forgot-password/help-text.jsx | src/features/auth/components/forgot-password/help-text.jsx | Move |
| src/components/auth/forgot-password/reset-password-form.jsx | src/features/auth/components/forgot-password/reset-password-form.jsx | Move |
| src/components/auth/forgot-password/success-actions.jsx | src/features/auth/components/forgot-password/success-actions.jsx | Move |
| src/components/auth/forgot-password/success-icon.jsx | src/features/auth/components/forgot-password/success-icon.jsx | Move |
| src/components/auth/forgot-password/success-message.jsx | src/features/auth/components/forgot-password/success-message.jsx | Move |
| src/components/auth/forgot-password/success-state.jsx | src/features/auth/components/forgot-password/success-state.jsx | Move |
| src/components/auth/forgot-password/troubleshooting-tips.jsx | src/features/auth/components/forgot-password/troubleshooting-tips.jsx | Move |
| src/components/auth/forms/auth-error-alert.jsx | src/features/auth/components/forms/auth-error-alert.jsx | Move |
| src/components/auth/forms/auth-form-provider.jsx | src/features/auth/components/forms/auth-form-provider.jsx | Move |
| src/components/auth/forms/auth-submit-button.jsx | src/features/auth/components/forms/auth-submit-button.jsx | Move |
| src/components/auth/forms/form-field.jsx | src/features/auth/components/forms/form-field.jsx | Move |
| src/components/auth/guards/protected-guard.jsx | src/features/auth/components/guards/protected-guard.jsx | Move |
| src/components/auth/guards/public-guard.jsx | src/features/auth/components/guards/public-guard.jsx | Move |
| src/components/auth/login/divider.jsx | src/features/auth/components/login/divider.jsx | Move |
| src/components/auth/login/login-form.jsx | src/features/auth/components/login/login-form.jsx | Move |
| src/components/auth/login/login-header.jsx | src/features/auth/components/login/login-header.jsx | Move |
| src/components/auth/login/login-options.jsx | src/features/auth/components/login/login-options.jsx | Move |
| src/components/auth/login/welcome-section.jsx | src/features/auth/components/login/welcome-section.jsx | Move |
| src/components/auth/panels/auth-right-panel.jsx | src/features/auth/components/panels/auth-right-panel.jsx | Move |
| src/components/auth/panels/background-decoration.jsx | src/features/auth/components/panels/background-decoration.jsx | Move |
| src/components/auth/panels/content-card.jsx | src/features/auth/components/panels/content-card.jsx | Move |
| src/components/auth/panels/header-section.jsx | src/features/auth/components/panels/header-section.jsx | Move |
| src/components/auth/panels/index.jsx | src/features/auth/components/panels/index.jsx | Move |
| src/components/auth/providers/auth-providers.jsx | src/features/auth/components/providers/auth-providers.jsx | Move |
| src/components/auth/reset-password/back-to-login-link.jsx | src/features/auth/components/reset-password/back-to-login-link.jsx | Move |
| src/components/auth/reset-password/form-header.jsx | src/features/auth/components/reset-password/form-header.jsx | Move |
| src/components/auth/reset-password/form-state.jsx | src/features/auth/components/reset-password/form-state.jsx | Move |
| src/components/auth/reset-password/help-text.jsx | src/features/auth/components/reset-password/help-text.jsx | Move |
| src/components/auth/reset-password/password-requirements.jsx | src/features/auth/components/reset-password/password-requirements.jsx | Move |
| src/components/auth/reset-password/reset-password-form.jsx | src/features/auth/components/reset-password/reset-password-form.jsx | Move |
| src/components/auth/reset-password/reset-password-header.jsx | src/features/auth/components/reset-password/reset-password-header.jsx | Move |
| src/components/auth/reset-password/security-tips.jsx | src/features/auth/components/reset-password/security-tips.jsx | Move |
| src/components/auth/reset-password/success-actions.jsx | src/features/auth/components/reset-password/success-actions.jsx | Move |
| src/components/auth/reset-password/success-icon.jsx | src/features/auth/components/reset-password/success-icon.jsx | Move |
| src/components/auth/reset-password/success-message.jsx | src/features/auth/components/reset-password/success-message.jsx | Move |
| src/components/auth/reset-password/success-state.jsx | src/features/auth/components/reset-password/success-state.jsx | Move |
| src/components/auth/shared/password-match-indicator.jsx | src/features/auth/components/shared/password-match-indicator.jsx | Move |
| src/components/auth/shared/password-strength-meter.jsx | src/features/auth/components/shared/password-strength-meter.jsx | Move |
| src/components/auth/signup/name-fields.jsx | src/features/auth/components/signup/name-fields.jsx | Move |
| src/components/auth/signup/password-fields.jsx | src/features/auth/components/signup/password-fields.jsx | Move |
| src/components/auth/signup/signup-form.jsx | src/features/auth/components/signup/signup-form.jsx | Move |
| src/components/auth/signup/signup-header.jsx | src/features/auth/components/signup/signup-header.jsx | Move |
| src/components/auth/signup/signup-options.jsx | src/features/auth/components/signup/signup-options.jsx | Move |
| src/components/auth/signup/terms-and-conditions.jsx | src/features/auth/components/signup/terms-and-conditions.jsx | Move |
| src/components/auth/signup/welcome-section.jsx | src/features/auth/components/signup/welcome-section.jsx | Move |
| src/components/auth/verify-email/back-to-login-link.jsx | src/features/auth/components/verify-email/back-to-login-link.jsx | Move |
| src/components/auth/verify-email/help-text.jsx | src/features/auth/components/verify-email/help-text.jsx | Move |
| src/components/auth/verify-email/resend-code-section.jsx | src/features/auth/components/verify-email/resend-code-section.jsx | Move |
| src/components/auth/verify-email/success-state.jsx | src/features/auth/components/verify-email/success-state.jsx | Move |
| src/components/auth/verify-email/timer-display.jsx | src/features/auth/components/verify-email/timer-display.jsx | Move |
| src/components/auth/verify-email/verification-form.jsx | src/features/auth/components/verify-email/verification-form.jsx | Move |
| src/components/auth/verify-email/verification-input.jsx | src/features/auth/components/verify-email/verification-input.jsx | Move |
| src/components/auth/verify-email/verify-email-header.jsx | src/features/auth/components/verify-email/verify-email-header.jsx | Move |
| src/components/auth/verify-email/welcome-section.jsx | src/features/auth/components/verify-email/welcome-section.jsx | Move |
| (new file) | src/features/auth/hooks/useAuthRouting.js | Create |
| (new file) | src/features/auth/hooks/useForgotPassword.js | Create |
| (new file) | src/features/auth/hooks/useLogin.js | Create |
| (new file) | src/features/auth/hooks/useResetPassword.js | Create |
| (new file) | src/features/auth/hooks/useSignup.js | Create |
| (new file) | src/features/auth/hooks/useVerifyEmail.js | Create |
| (new file) | src/features/dashboard/hooks/useDashboard.js | Create |
| (new file) | src/features/auth/hooks/useAuthBootstrap.js | Create |
| (new file) | src/features/auth/hooks/useAuthGuard.js | Create |

### Summary
- Total components: 99
- Currently DUMB: 76
- Currently SMART (need refactoring): 11
- Hooks to create: 9
- Files to move: 63
- Files to create: 9
