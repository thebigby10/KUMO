// Re-export everything from the centralized prisma module
// This maintains backward compatibility for files importing from @/models/models
export { db, prisma, Prisma } from '@/lib/prisma'
export * from '@/lib/prisma'
