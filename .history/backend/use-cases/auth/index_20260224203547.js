// backend/use-cases/auth/index.js

/**
 * Auth Use Cases — Pure business logic, decoupled from HTTP layer.
 *
 * Each use case:
 *   - Receives a plain DTO (no req/res)
 *   - Returns a result object: { success, statusCode, message, data?, errorCode? }
 *   - Controllers are thin HTTP adapters that call these use cases
 */

export { loginUseCase } from "./login.use-case.js";
export { registerUseCase } from "./register.use-case.js";
export { logoutUseCase } from "./logout.use-case.js";
export { refreshTokenUseCase } from "./refresh-token.use-case.js";
export { forgotPasswordUseCase } from "./forgot-password.use-case.js";
export { resetPasswordUseCase } from "./reset-password.use-case.js";
export { verifyEmailUseCase } from "./verify-email.use-case.js";
