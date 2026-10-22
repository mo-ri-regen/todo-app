import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Next.js と同じように .env.local から DATABASE_URL を読み込む
loadEnvConfig(process.cwd());

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
