import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response | void>;
export declare const requireRole: (roles: string[]) => ((req: AuthRequest, res: Response, next: NextFunction) => void);
