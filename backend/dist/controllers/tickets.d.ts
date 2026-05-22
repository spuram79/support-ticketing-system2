import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getTickets: (req: Request, res: Response) => Promise<Response | void>;
export declare const getTicketById: (req: Request, res: Response) => Promise<Response | void>;
export declare const createTicket: (req: AuthRequest, res: Response) => Promise<Response | void>;
export declare const updateTicket: (req: AuthRequest, res: Response) => Promise<Response | void>;
export declare const deleteTicket: (req: Request, res: Response) => Promise<Response | void>;
export declare const getTicketStats: (req: Request, res: Response) => Promise<Response | void>;
