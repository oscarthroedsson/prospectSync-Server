import { Express } from "express";
export declare class HttpServer {
    private app;
    private server;
    constructor(app: Express);
    start(): Promise<void>;
    stop(): Promise<void>;
}
//# sourceMappingURL=server.d.ts.map