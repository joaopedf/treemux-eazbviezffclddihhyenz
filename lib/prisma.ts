import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma 7 with "client" engine type requires adapter
const createPrismaInstance = () => {
  const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
  const libsql = createClient({ url: dbUrl });
  const adapter = new PrismaLibSql({ url: dbUrl });
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? createPrismaInstance();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
