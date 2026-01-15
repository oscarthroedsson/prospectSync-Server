"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobPostingMapper = jobPostingMapper;
function jobPostingMapper(data, url, createdById) {
    const today = new Date().toISOString();
    const jobPosting = {
        ...data,
        jobPostingUrl: url,
        createdAt: today,
        updatedAt: today,
        createdJobPosting: {
            createdByType: "system",
            createdById: createdById,
            source: "url",
            importedAt: today,
        },
    };
    return jobPosting;
}
//# sourceMappingURL=job-posting.mapper.js.map