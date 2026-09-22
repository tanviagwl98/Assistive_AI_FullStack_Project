import "server-only";
import { addDays } from "@/lib/date";
import { SESSION_DURATION_DAYS } from "@/constants/auth";
import { AppError } from "@/server/api/errors";
import { connectToDatabase } from "@/server/db/mongoose";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { createOpaqueToken, hashSensitiveToken } from "@/server/auth/tokens";
import { User } from "./models/user.model";
import { Session } from "./models/session.model";
import { normalizeEmail } from "./auth.schema";

export async function signup(input: { name: string; email: string; password: string }) {
  await connectToDatabase();
  const emailNormalized = normalizeEmail(input.email);
  if (await User.exists({ emailNormalized })) throw new AppError("CONFLICT", "An account with this email already exists.", 409);
  const user = await User.create({ name: input.name.trim(), email: input.email.trim(), emailNormalized, passwordHash: await hashPassword(input.password) });
  return { user, ...await createSession(user.id) };
}
export async function login(input: { email: string; password: string }) {
  await connectToDatabase();
  const user = await User.findOne({ emailNormalized: normalizeEmail(input.email) });
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) throw new AppError("UNAUTHENTICATED", "Invalid email or password.", 401);
  return { user, ...await createSession(user.id) };
}
export async function createSession(userId: string) {
  const token = createOpaqueToken(); const expiresAt = addDays(new Date(), SESSION_DURATION_DAYS);
  await Session.create({ userId, tokenHash: hashSensitiveToken(token), expiresAt });
  return { token, expiresAt };
}
export async function deleteSession(token: string) { await connectToDatabase(); await Session.deleteOne({ tokenHash: hashSensitiveToken(token) }); }
