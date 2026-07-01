import { Router } from "express";
import { login, changePassword, getProfile } from "../controllers/authController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.post("/login", login);
router.get("/profile", authenticateToken, getProfile);
router.post("/change-password", authenticateToken, changePassword);

export default router;
