import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { beforeAll, afterAll, beforeEach } from "vitest";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.test to ensure MONGOMS_* vars are set before MongoMemoryServer is used
dotenv.config({ path: resolve(__dirname, "../../.env.test") });

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: process.env.MONGOMS_VERSION || "6.0.6",
      downloadDir: resolve(__dirname, "../../.mongodb-binaries"),
    },
  });

  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer?.stop();
}, 30000);

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
