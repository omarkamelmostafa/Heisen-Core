import { verify2faUseCase } from "../../use-cases/auth/verify-2fa.use-case.js";
import { sendUseCaseResponse } from "../auth/auth-shared.js";
import { setRefreshTokenCookie } from "../../services/auth/cookie-service.js";

export const handleVerify2fa = async (req, res, next) => {
  try {
    const { token, tempToken } = req.body;
    const userAgent = req.headers["user-agent"] || "";
    const ipAddress = req.ip;

    const result = await verify2faUseCase({
      token,
      tempToken,
      userAgent,
      ipAddress,
    });

    if (result.success && result.data && result.data.refreshTokenValue) {
      setRefreshTokenCookie(res, result.data.refreshTokenValue);
      delete result.data.refreshTokenValue;
    }

    return sendUseCaseResponse(req, res, result);
  } catch (error) {
    next(error);
  }
};
