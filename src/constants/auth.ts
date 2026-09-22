export const SESSION_COOKIE_NAME = "mmm_session";
export const SESSION_DURATION_DAYS = 30;
export const MEMBER_ROLES = ["ADMIN", "MANAGER"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];
