// Re-export the centralized Prisma client
// This ensures all parts of the app use the same instance
import { db } from '@/models/models'

export default db