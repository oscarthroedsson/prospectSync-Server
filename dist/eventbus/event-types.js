"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventType = void 0;
var EventType;
(function (EventType) {
    // Application events
    EventType["APPLICATION_CREATED"] = "application.created";
    EventType["APPLICATION_STAGE_CHANGED"] = "application.stage_changed";
    EventType["APPLICATION_REJECTED"] = "application.rejected";
    EventType["APPLICATION_HIRED"] = "application.hired";
    // Job posting events
    EventType["JOB_POSTING_EXPIRING_SOON"] = "job_posting.expiring_soon";
    EventType["JOB_POSTING_EXPIRED"] = "job_posting.expired";
    // Trigger events
    EventType["REMINDER_TRIGGER"] = "trigger.reminder";
})(EventType || (exports.EventType = EventType = {}));
//# sourceMappingURL=event-types.js.map