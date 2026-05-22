import { NextFunction, Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}
export declare const authentication: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export { AuthenticatedRequest };
