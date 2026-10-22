import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/lib/db/schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set.");
  }
  return drizzle(neon(url), { schema });
}

let db: ReturnType<typeof createDb> | undefined;

// ビルド時に DATABASE_URL がなくても失敗しないよう、初めて使うときに接続を作る
export function getDb() {
  return (db ??= createDb());
}
