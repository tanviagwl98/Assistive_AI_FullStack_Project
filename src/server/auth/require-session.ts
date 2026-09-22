import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/constants/auth";
import { unauthenticated } from "@/server/api/errors";
import { hashSensitiveToken } from "./tokens";
import { Session } from "@/modules/auth/models/session.model";
import { User } from "@/modules/auth/models/user.model";
import { WeddingMembership } from "@/modules/memberships/models/wedding-membership.model";
import { connectToDatabase } from "@/server/db/mongoose";

export async function getSessionContext() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  await connectToDatabase();
  const session = await Session.findOne({ tokenHash: hashSensitiveToken(token), expiresAt: { $gt: new Date() } }).lean();
  if (!session) return null;
  const [user, membership] = await Promise.all([User.findById(session.userId).lean(), WeddingMembership.findOne({ userId: session.userId }).lean()]);
  if (!user) return null;
  return { session, user, membership };
}
export async function requireUser() { const context = await getSessionContext(); if (!context) throw unauthenticated(); return context; }
export async function requireWeddingMember() { const context = await requireUser(); if (!context.membership) throw unauthenticated(); return { ...context, weddingId: context.membership.weddingId }; }
