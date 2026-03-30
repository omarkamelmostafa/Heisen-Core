// backend/controllers/auth/register.controller.js
import { registerUseCase } from "../../use-cases/auth/index.js";
import { sendUseCaseResponse } from "./auth-shared.js";

/**
 * Register Controller — Thin HTTP adapter.
 * Parses request, delegates to registerUseCase, formats response.
 */
export const handleRegister = async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  const result = await registerUseCase({
    firstname: firstName,
    lastname: lastName,
    email,
    password,
    confirmPassword,
    clientIP: req.ip,
  });

  return sendUseCaseResponse(req, res, result);
};
