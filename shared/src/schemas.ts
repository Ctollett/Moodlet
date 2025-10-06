import { z } from "zod";

// Shared Zod validation schemas

export const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8),
});

export const boardSchema = z.object({
  name: z.string().min(1).max(100),
});

export const elementSchema = z.object({
  type: z.enum(["note", "text", "image", "shape"]),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  data: z.record(z.unknown()),
});
