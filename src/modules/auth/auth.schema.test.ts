import { describe, expect, it } from "vitest";
import { loginSchema, normalizeEmail, signupSchema } from "./auth.schema";

describe("authentication request schemas", () => {
  it("normalizes email without provider-specific transformations", () => {
    expect(normalizeEmail("  Akshay.Saini+family@Example.COM ")).toBe("akshay.saini+family@example.com");
  });

  it("accepts a valid signup payload", () => {
    expect(signupSchema.parse({ name: "Akshay Saini", email: "akshay@example.com", password: "eight-char" })).toMatchObject({ name: "Akshay Saini" });
  });

  it("rejects a short password and invalid login email", () => {
    expect(() => signupSchema.parse({ name: "Akshay", email: "akshay@example.com", password: "short" })).toThrow();
    expect(() => loginSchema.parse({ email: "not-an-email", password: "password" })).toThrow();
  });
});
