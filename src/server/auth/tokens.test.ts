import { beforeEach, describe, expect, it } from "vitest";
import { createOpaqueToken, hashSensitiveToken } from "./tokens";

describe("opaque authentication tokens", () => {
  beforeEach(() => { process.env.AUTH_TOKEN_SECRET = "test-secret"; });

  it("creates distinct high-entropy URL-safe tokens", () => {
    const first = createOpaqueToken();
    const second = createOpaqueToken();
    expect(first).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(second).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(first).not.toBe(second);
  });

  it("derives a stable, non-raw server-side token hash", () => {
    const token = "a-session-token";
    expect(hashSensitiveToken(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashSensitiveToken(token)).toBe(hashSensitiveToken(token));
    expect(hashSensitiveToken(token)).not.toBe(token);
  });
});
