import { Request, Response } from 'express';
export declare const handleWebhook: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
