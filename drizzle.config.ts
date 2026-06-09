import "dotenv/config"
import type { Config } from "drizzle-kit"

export default {
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  // Drizzle Kit will read schema in camelCase, but our DB column names are
  // snake_case (defined explicitly per column). Keep verbose so column types
  // are easy to read in generated SQL.
  verbose: true,
  strict: true,
} satisfies Config
