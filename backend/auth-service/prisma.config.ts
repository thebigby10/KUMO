/**
 * AUTH-SERVICE PRISMA CONFIGURATION
 * 
 * ⚠️  IMPORTANT: This service does NOT own the database schema!
 * 
 * The frontend (/frontend/prisma) is the single source of truth for:
 *   - Schema definitions
 *   - Database migrations
 * 
 * This service only uses Prisma for:
 *   - Type generation (prisma generate)
 *   - Reading/writing to the `users` table for authentication
 * 
 * NEVER run `prisma migrate` from this directory!
 * All schema changes must go through /frontend/prisma/schema.prisma
 */
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  // Migrations are disabled - frontend owns the schema
  // migrations: { path: "prisma/migrations" },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
