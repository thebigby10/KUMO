import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient as PrismaClientConstructor } from '@/generated/prisma'

// Re-export all types from the generated Prisma client for consistent imports
export * from '@/generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClientConstructor
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = globalForPrisma.prisma || new PrismaClientConstructor({
  adapter,
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Export both as default and named for flexibility
export default prisma
export { prisma, prisma as db }