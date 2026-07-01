import { Router } from "express";
import { getUsers, createUser, updateUser, deleteUser } from "../controllers/usersController";
import { authenticateToken, requireAdmin } from "../middlewares/auth";

const router = Router();

// Secure all user management routes to authenticated admins only
router.use(authenticateToken, requireAdmin);

router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
