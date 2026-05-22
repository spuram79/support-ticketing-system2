import { z } from 'zod';
export declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        production: "production";
        development: "development";
        test: "test";
    }>>;
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    DATABASE_URL: z.ZodString;
    REDIS_URL: z.ZodDefault<z.ZodString>;
    JWT_SECRET: z.ZodString;
    JWT_EXPIRES_IN: z.ZodDefault<z.ZodString>;
    CORS_ORIGIN: z.ZodDefault<z.ZodString>;
    OPENAI_API_KEY: z.ZodOptional<z.ZodString>;
    SMTP_HOST: z.ZodOptional<z.ZodString>;
    SMTP_PORT: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    SMTP_USER: z.ZodOptional<z.ZodString>;
    SMTP_PASS: z.ZodOptional<z.ZodString>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<{
        error: "error";
        warn: "warn";
        info: "info";
        debug: "debug";
    }>>;
}, z.core.$strip>;
export declare const env: {
    NODE_ENV: string;
    PORT: number;
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    CORS_ORIGIN: string;
    OPENAI_API_KEY: string | undefined;
    SMTP_HOST: string | undefined;
    SMTP_PORT: number | undefined;
    SMTP_USER: string | undefined;
    SMTP_PASS: string | undefined;
    LOG_LEVEL: any;
};
