import "server-only";

const required = ["MONGODB_URI", "AUTH_TOKEN_SECRET"] as const;
export type RequiredEnvironment = (typeof required)[number];

export function getRequiredEnv(name: RequiredEnvironment): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}
