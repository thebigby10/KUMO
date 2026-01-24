/**
 * FRONTEND PRISMA CONFIGURATION
 * 
 * This is the PRIMARY Prisma configuration for the KUMO project.
 * The frontend owns all database migrations.
 * 
 * See /ARCHITECTURE.md for the full schema ownership documentation.
 * 
 * Commands to run from this directory (/frontend):
 *   - npx prisma migrate dev      # Create and apply migrations
 *   - npx prisma generate         # Generate Prisma Client
 *   - npx prisma db push          # Push schema without migrations (dev only)
 *   - npx prisma studio           # Open database GUI
 */
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations'
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});