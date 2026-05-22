import { Worker } from 'bullmq';
export declare const categorizeTicket: (ticketId: string) => Promise<void>;
export declare const routeTicket: (ticketId: string) => Promise<void>;
export declare const findSimilarTickets: (ticketId: string) => Promise<any>;
export declare const startAICategoryWorker: () => Worker<any, any, string>;
