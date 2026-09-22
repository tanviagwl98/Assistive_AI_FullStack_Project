import { describe, expect, it } from "vitest";
import { loginSchema, normalizeEmail, signupSchema } from "./auth.schema";

describe("authentication request schemas", () => {
  it("normalizes email without provider-specific transformations", () => {
    expect(normalizeEmail("  Tanvi.Saini+family@Example.COM ")).toBe("tanvi.saini+family@example.com");
  });

  it("accepts a valid signup payload", () => {
    expect(signupSchema.parse({ name: "Tanvi Saini", email: "tanvi@example.com", password: "eight-char" })).toMatchObject({ name: "Tanvi Saini" });
  });

  it("rejects a short password and invalid login email", () => {
    expect(() => signupSchema.parse({ name: "Tanvi", email: "tanvi@example.com", password: "short" })).toThrow();
    expect(() => loginSchema.parse({ email: "not-an-email", password: "password" })).toThrow();
  });
});
