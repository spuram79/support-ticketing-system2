export declare const logger: {
    info: (msg: string, ...args: any[]) => void;
    error: (msg: string, ...args: any[]) => void;
    warn: (msg: string, ...args: any[]) => void;
};
export declare const createLogger: () => {
    info: (msg: string, ...args: any[]) => void;
    error: (msg: string, ...args: any[]) => void;
    warn: (msg: string, ...args: any[]) => void;
};
