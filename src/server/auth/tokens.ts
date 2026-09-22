import "server-only";
import { createHash, randomBytes } from "crypto";
import { getRequiredEnv } from "@/server/env";

export const createOpaqueToken = () => randomBytes(32).toString("base64url");
export const hashSensitiveToken = (token: string) => createHash("sha256").update(`${getRequiredEnv("AUTH_TOKEN_SECRET")}:${token}`).digest("hex");
