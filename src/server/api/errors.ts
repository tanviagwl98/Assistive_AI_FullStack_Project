import { NextResponse } from "next/server";

export type ErrorCode = "VALIDATION_ERROR" | "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "INVALID_TOKEN" | "TOKEN_EXPIRED" | "RATE_LIMITED" | "UPLOAD_ERROR" | "EXTERNAL_SERVICE_ERROR" | "INTERNAL_ERROR";

export class AppError extends Error {
  constructor(public readonly code: ErrorCode, message: string, public readonly status: number, public readonly details?: Record<string, string>) { super(message); }
}
export const unauthenticated = () => new AppError("UNAUTHENTICATED", "Authentication is required.", 401);
export const forbidden = () => new AppError("FORBIDDEN", "You do not have permission to perform this action.", 403);
export const notFound = () => new AppError("NOT_FOUND", "The requested resource was not found.", 404);

export function errorResponse(error: unknown) {
  if (error instanceof AppError) return NextResponse.json({ error: { code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}) } }, { status: error.status });
  console.error("Unhandled API error", error);
  return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." } }, { status: 500 });
}
