import express from "express";
import { getCurrentUser } from "../../controllers/user/user.controller.js";
import { authTokenMiddleware } from "../../middleware/auth/authTokenMiddleware.js";

const router = express.Router();

// GET /api/v1/user/me
router.get("/me", authTokenMiddleware, getCurrentUser);

export default router;
