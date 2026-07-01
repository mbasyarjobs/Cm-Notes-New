import { Router } from "express";
import { getNotes, createNote, updateNote, deleteNote } from "../controllers/notesController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.get("/", authenticateToken, getNotes);
router.post("/", authenticateToken, createNote);
router.put("/:id", authenticateToken, updateNote);
router.delete("/:id", authenticateToken, deleteNote);

export default router;
