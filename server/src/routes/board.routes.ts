import { Router } from "express";

import { createBoard, deleteBoard, getBoards } from "@/controllers/board.controller";
import { validateToken } from "@/middleware/auth.middleware";
import { validateCreateBoard } from "@/middleware/validation.middleware";

const router = Router();

router.get("/", validateToken, getBoards);

router.post("/", validateToken, validateCreateBoard, createBoard);

router.delete("/:id", validateToken, deleteBoard);

export default router;
