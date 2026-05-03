import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";

const storeRoot = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(storeRoot, ".env") });
import { Pool } from "pg";
import { PrismaClient } from "./generated/prisma/client";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

export * from "./model"