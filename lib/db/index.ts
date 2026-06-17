import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  if (!db) {
    const sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql, { schema });
  }

  return db;
}
