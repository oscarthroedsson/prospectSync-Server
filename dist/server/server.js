"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpServer = void 0;
const config_1 = require("../config");
class HttpServer {
    app;
    server = null;
    constructor(app) {
        this.app = app;
    }
    start() {
        return new Promise((resolve, reject) => {
            const port = parseInt(config_1.env.PORTCODE, 10) || 8080;
            this.server = this.app.listen(port, () => {
                console.log(`🚀 [Server] HTTP server started on port ${port}`);
                resolve();
            });
            this.server.on("error", (error) => {
                console.error("❌ [Server] Server error:", error);
                reject(error);
            });
        });
    }
    async stop() {
        return new Promise((resolve, reject) => {
            if (!this.server) {
                resolve();
                return;
            }
            this.server.close((err) => {
                if (err) {
                    console.error("❌ [Server] Error closing server:", err);
                    reject(err);
                }
                else {
                    console.log("✅ [Server] Server closed");
                    resolve();
                }
            });
        });
    }
}
exports.HttpServer = HttpServer;
//# sourceMappingURL=server.js.map