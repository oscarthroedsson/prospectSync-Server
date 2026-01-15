"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduler = void 0;
const cron = __importStar(require("node-cron"));
class Scheduler {
    jobs = new Map();
    constructor() {
        // EventBus is accessed via getEventBus() when needed in jobs
    }
    addJob(job) {
        const jobName = job.name();
        // Run immediately on start
        console.log(`⏰ [Scheduler] Running job immediately: ${jobName}`);
        job.run().catch((err) => {
            console.error(`❌ [Scheduler] Job ${jobName} failed:`, err);
        });
        // Calculate time until next midnight
        const now = new Date();
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
        const initialDelay = midnight.getTime() - now.getTime();
        // Schedule first run at midnight
        setTimeout(() => {
            console.log(`⏰ [Scheduler] Running job at midnight: ${jobName}`);
            job.run().catch((err) => {
                console.error(`❌ [Scheduler] Job ${jobName} failed:`, err);
            });
        }, initialDelay);
        // Then run every 24 hours (at midnight)
        const task = cron.schedule("0 0 * * *", () => {
            console.log(`⏰ [Scheduler] Running job: ${jobName}`);
            job.run().catch((err) => {
                console.error(`❌ [Scheduler] Job ${jobName} failed:`, err);
            });
        });
        this.jobs.set(jobName, task);
        console.log(`✅ [Scheduler] Job ${jobName} added`);
    }
    start() {
        console.log(`🚀 [Scheduler] Starting scheduler with ${this.jobs.size} job(s)`);
        this.jobs.forEach((task, name) => {
            task.start();
            console.log(`✅ [Scheduler] Job ${name} started`);
        });
    }
    stop() {
        console.log("🛑 [Scheduler] Stopping scheduler...");
        this.jobs.forEach((task, name) => {
            task.stop();
            console.log(`✅ [Scheduler] Job ${name} stopped`);
        });
        this.jobs.clear();
        console.log("✅ [Scheduler] All jobs stopped");
    }
}
exports.Scheduler = Scheduler;
//# sourceMappingURL=scheduler.js.map