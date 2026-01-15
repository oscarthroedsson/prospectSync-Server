"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyJobPostingCheck = void 0;
const job_posting_repository_1 = require("../../repositories/job-posting.repository");
const event_bus_1 = require("../../eventbus/event-bus");
const event_types_1 = require("../../eventbus/event-types");
class DailyJobPostingCheck {
    repo = (0, job_posting_repository_1.getJobPostingRepository)();
    bus = (0, event_bus_1.getEventBus)();
    daysAhead = 3; // Default: check for jobs expiring in the next 3 days
    name() {
        return "DailyJobPostingCheck";
    }
    async run() {
        console.log("🔍 [DailyJobPostingCheck] Starting daily job posting check...");
        // Check for expired job postings
        try {
            await this.checkExpired();
        }
        catch (err) {
            console.error(`❌ [DailyJobPostingCheck] Error checking expired jobs:`, err);
            // Continue to check expiring jobs even if expired check fails
        }
        // Check for job postings expiring soon
        try {
            await this.checkExpiringSoon();
        }
        catch (err) {
            console.error(`❌ [DailyJobPostingCheck] Error checking expiring jobs:`, err);
            throw err;
        }
        console.log("✅ [DailyJobPostingCheck] Daily check completed");
    }
    async checkExpired() {
        const expiredJobs = await this.repo.findExpired();
        console.log(`📊 [DailyJobPostingCheck] Found ${expiredJobs.length} expired job posting(s)`);
        for (const job of expiredJobs) {
            if (!job.id) {
                continue;
            }
            // Publish event for expired job posting
            this.bus.publish({
                type: event_types_1.EventType.JOB_POSTING_EXPIRED,
                payload: {
                    jobId: job.id,
                    title: job.title,
                    companyName: job.companyName,
                    endsAt: job.endsAt,
                    url: job.jobPostingUrl,
                },
            });
            console.log(`📤 [DailyJobPostingCheck] Published EventJobPostingExpired for job: ${job.id}`);
        }
    }
    async checkExpiringSoon() {
        const expiringJobs = await this.repo.findExpiringSoon(this.daysAhead);
        console.log(`📊 [DailyJobPostingCheck] Found ${expiringJobs.length} job posting(s) expiring within ${this.daysAhead} days`);
        for (const job of expiringJobs) {
            if (!job.id) {
                continue;
            }
            // Publish event for expiring job posting
            this.bus.publish({
                type: event_types_1.EventType.JOB_POSTING_EXPIRING_SOON,
                payload: {
                    jobId: job.id,
                    title: job.title,
                    companyName: job.companyName,
                    endsAt: job.endsAt,
                    url: job.jobPostingUrl,
                },
            });
            console.log(`📤 [DailyJobPostingCheck] Published EventJobPostingExpiringSoon for job: ${job.id}`);
        }
    }
}
exports.DailyJobPostingCheck = DailyJobPostingCheck;
//# sourceMappingURL=daily-job-posting-check.job.js.map