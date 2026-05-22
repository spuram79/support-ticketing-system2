import { Worker } from 'bullmq';
export declare const categorizationWorker: Worker<any, any, string>;
export declare const slaWorker: Worker<any, any, string>;
export declare const emailWorker: Worker<any, any, string>;
declare const startWorkers: () => void;
export { startWorkers };
