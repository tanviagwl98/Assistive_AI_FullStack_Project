import { ZodError, type ZodType } from "zod";
import { AppError, errorResponse } from "./errors";

export async function parseJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
  try { return schema.parse(await request.json()); }
  catch (error) {
    if (error instanceof ZodError) throw new AppError("VALIDATION_ERROR", "Invalid request data", 400, Object.fromEntries(error.issues.map((issue) => [issue.path.join(".") || "body", issue.message])));
    throw new AppError("VALIDATION_ERROR", "Invalid JSON request body", 400);
  }
}
export async function handleRoute<T>(callback: () => Promise<T>): Promise<T | ReturnType<typeof errorResponse>> {
  try { return await callback(); } catch (error) { return errorResponse(error); }
}
