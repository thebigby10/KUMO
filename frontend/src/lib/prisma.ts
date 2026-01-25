// Re-export the centralized Prisma client
// This ensures all parts of the app use the same instance
// Riyad's API routes import from @/lib/prisma, so we provide this alias
import { db } from '@/models/models'

export default db
