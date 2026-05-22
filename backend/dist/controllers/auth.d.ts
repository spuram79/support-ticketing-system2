import { Request, Response } from 'express';
export declare const login: (req: Request, res: Response) => Promise<Response | void>;
export declare const register: (req: Request, res: Response) => Promise<Response | void>;
export declare const getProfile: (req: Request, res: Response) => Promise<Response | void>;
export declare const updateProfile: (req: Request, res: Response) => Promise<Response | void>;
export declare const changePassword: (req: Request, res: Response) => Promise<Response | void>;
