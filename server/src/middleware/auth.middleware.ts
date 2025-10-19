import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        iat?: number;
        exp?: number;
      };
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

export const validateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "No token provided or invalid format." });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({ message: "Server configuration error" });
  }

  try {
    const decoded = jwt.verify(token, secret) as { userId: string; iat?: number; exp?: number };
    req.user = decoded;
    return next();
  } catch {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
