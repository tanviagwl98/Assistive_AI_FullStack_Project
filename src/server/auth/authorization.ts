import "server-only";
import { forbidden } from "@/server/api/errors";
import type { MemberRole } from "@/constants/auth";
export function requireAdmin(role: MemberRole) { if (role !== "ADMIN") throw forbidden(); }
