import { NextFunction, Request, Response } from 'express';
interface CustomError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}
export declare class AppError extends Error implements CustomError {
    statusCode: number;
    isOperational: boolean;
    stack?: string;
    constructor(message: string, statusCode?: number);
}
export declare const errorHandler: (err: CustomError, req: Request, res: Response, next: NextFunction) => void;
export {};
