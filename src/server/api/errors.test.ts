import { describe, expect, it } from "vitest";
import { AppError, errorResponse } from "./errors";

describe("API error responses", () => {
  it("uses the standard documented error envelope", async () => {
    const response = errorResponse(new AppError("NOT_FOUND", "Not found", 404));
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: { code: "NOT_FOUND", message: "Not found" } });
  });
});
