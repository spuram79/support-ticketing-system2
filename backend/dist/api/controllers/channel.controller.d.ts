import { Request, Response } from 'express';
export declare const getChannels: (req: any, res: Response) => Promise<void>;
export declare const handleEmail: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const handleSMS: (req: Request, res: Response) => Promise<void>;
export declare const handleWhatsApp: (req: Request, res: Response) => Promise<void>;
export declare const handlePhone: (req: Request, res: Response) => Promise<void>;
