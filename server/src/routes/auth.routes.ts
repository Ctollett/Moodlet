import { Router } from "express";

import { validateRegister, validateLogin } from "../middleware/validation.middleware";

const router = Router();

router.post("/api/auth/register", validateRegister);

router.post("/api/auth/login", validateLogin);

export default router;
