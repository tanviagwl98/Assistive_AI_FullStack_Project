import "server-only";
import mongoose from "mongoose";
import { getRequiredEnv } from "@/server/env";

declare global { var mongooseConnection: Promise<typeof mongoose> | undefined; }

export async function connectToDatabase() {
  if (!global.mongooseConnection) {
    global.mongooseConnection = mongoose.connect(getRequiredEnv("MONGODB_URI"), { bufferCommands: false });
  }
  return global.mongooseConnection;
}
