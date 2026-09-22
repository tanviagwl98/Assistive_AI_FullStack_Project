import { z } from "zod";
export const signupSchema = z.object({ name: z.string().trim().min(1).max(120), email: z.string().trim().email(), password: z.string().min(8).max(128) });
export const loginSchema = signupSchema.pick({ email: true, password: true });
export const normalizeEmail = (email: string) => email.trim().toLowerCase();
