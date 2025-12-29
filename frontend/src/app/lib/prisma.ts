import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient as PrismaClientConstructor, type PrismaClient as PrismaClientType } from '../../../generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClientType
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = globalForPrisma.prisma || new PrismaClientConstructor({
  adapter,
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma