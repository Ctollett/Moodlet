import { Router } from "express";

import authRoutes from "./auth.routes";
import boardRoutes from "./board.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/boards", boardRoutes);

export default router;
