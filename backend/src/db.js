import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { config } from "./config.js";
import "./models/index.js";

let embedded = null;

export async function connectDb(uri = config.mongoUri) {
  if (!uri) {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const dbPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.data");
    mkdirSync(dbPath, { recursive: true });
    embedded = await MongoMemoryServer.create({
      instance: { dbPath, storageEngine: "wiredTiger", port: 27018 },
    });
    uri = embedded.getUri("mindmate");
    console.log("[db] No MONGODB_URI set - using embedded MongoDB (data in backend/.data)");
  }
  await mongoose.connect(uri);
  await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
  return mongoose.connection;
}

export async function disconnectDb() {
  await mongoose.disconnect();
  if (embedded) {
    await embedded.stop({ doCleanup: false });
    embedded = null;
  }
}
