import Redis from 'ioredis';
export declare const redisConnection: {
    host: string;
    port: number;
    password: string | undefined;
    db: number;
};
export declare const redis: Redis;
