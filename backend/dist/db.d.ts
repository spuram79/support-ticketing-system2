import { PrismaClient } from '@prisma/client';
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
declare const prismaClientSingleton: () => PrismaClient<{
    log: ({
        level: "query";
        emit: "stdout";
    } | {
        level: "error";
        emit: "stdout";
    } | {
        level: "warn";
        emit: "stdout";
    })[];
}, never, import("@prisma/client/runtime/library").DefaultArgs>;
declare global {
    var __globalPrisma__: ReturnType<typeof prismaClientSingleton>;
}
declare const prisma: PrismaClient<{
    log: ({
        level: "query";
        emit: "stdout";
    } | {
        level: "error";
        emit: "stdout";
    } | {
        level: "warn";
        emit: "stdout";
    })[];
}, never, import("@prisma/client/runtime/library").DefaultArgs>;
export { prisma };
export declare const logger: {
    info: (msg: string, ...args: any[]) => void;
    error: (msg: string, ...args: any[]) => void;
    warn: (msg: string, ...args: any[]) => void;
};
