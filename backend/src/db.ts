import { PrismaClient } from '@prisma/client';
import { createLogger } from './utils/logger';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL?: string;
      JWT_SECRET?: string;
      REDIS_URL?: string;
      PORT?: string;
      NODE_ENV?: string;
    }
  }
}

// Create Prisma client singleton
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      { level: 'query', emit: 'stdout' },
      { level: 'error', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  });
};

declare global {
  var __globalPrisma__: ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.__globalPrisma__ ||= prismaClientSingleton();

export { prisma };
export const logger = createLogger();