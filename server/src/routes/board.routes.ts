import { Router } from "express";

import { createBoard, deleteBoard, getBoards } from "../controllers/board.controller.js";
import { validateToken } from "../middleware/auth.middleware.js";
import { validateCreateBoard } from "../middleware/validation.middleware.js";

const router = Router();

router.get("/", validateToken, getBoards);

router.post("/", validateToken, validateCreateBoard, createBoard);

router.delete("/:id", validateToken, deleteBoard);

export default router;
