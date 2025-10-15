import { Request, Response, NextFunction } from "express";

/**
 * Validates registration data
 */
export const validateRegister = (_req: Request, _res: Response, _next: NextFunction) => {
  // TODO: Implement registration validation using registerSchema from @moodlet/shared
};

/**
 * Validates login data
 */
export const validateLogin = (_req: Request, _res: Response, _next: NextFunction) => {
  // TODO: Implement login validation using loginSchema from @moodlet/shared
};
