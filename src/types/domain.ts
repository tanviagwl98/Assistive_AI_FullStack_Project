import type { MemberRole } from "@/constants/auth";
export interface AuthenticatedWeddingContext { userId: string; weddingId: string; membershipId: string; role: MemberRole; }
