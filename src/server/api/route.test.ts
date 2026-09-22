import { describe, expect, it } from "vitest";
import { z } from "zod";
import { parseJson } from "./route";

describe("API request validation", () => {
  it("parses a valid JSON request with its schema", async () => {
    const result = await parseJson(new Request("http://localhost/api/test", { method: "POST", body: JSON.stringify({ name: "Mehendi" }) }), z.object({ name: z.string() }));
    expect(result).toEqual({ name: "Mehendi" });
  });

  it("maps schema failures to the documented validation error", async () => {
    await expect(parseJson(new Request("http://localhost/api/test", { method: "POST", body: JSON.stringify({ count: 0 }) }), z.object({ count: z.number().positive() }))).rejects.toMatchObject({ code: "VALIDATION_ERROR", status: 400 });
  });
});
