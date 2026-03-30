// backend/controllers/auth/register.controller.js
import { registerUseCase } from "../../use-cases/auth/index.js";
import { apiResponseManager } from "../../utilities/general/response-manager.js";

/**
 * Register Controller — Thin HTTP adapter.
 * Parses request, delegates to registerUseCase, formats response.
 */
export const handleRegister = async (req, res) => {
  const { firstname, lastname, email, password, confirmPassword } = req.body;

  const result = await registerUseCase({
    firstname,
    lastname,
    email,
    password,
    confirmPassword,
    clientIP: req.ip,
  });

  return apiResponseManager(req, res, {
    statusCode: result.statusCode,
    success: result.success,
    message: result.message,
    ...(result.errorCode && { errorCode: result.errorCode }),
    ...(result.data && { data: result.data }),
  });
};
