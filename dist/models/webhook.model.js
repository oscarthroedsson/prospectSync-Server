"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookType = exports.WebhookEvent = exports.WebhookStatus = void 0;
var WebhookStatus;
(function (WebhookStatus) {
    WebhookStatus["STARTED"] = "started";
    WebhookStatus["RUNNING"] = "running";
    WebhookStatus["SUCCESS"] = "success";
    WebhookStatus["ERROR"] = "error";
})(WebhookStatus || (exports.WebhookStatus = WebhookStatus = {}));
var WebhookEvent;
(function (WebhookEvent) {
    WebhookEvent["SCAN"] = "scan";
    WebhookEvent["ANALYZE"] = "analyze";
})(WebhookEvent || (exports.WebhookEvent = WebhookEvent = {}));
var WebhookType;
(function (WebhookType) {
    WebhookType["PDF"] = "pdf";
    WebhookType["JOB_POSTING"] = "job-posting";
    WebhookType["REPO"] = "repo";
    WebhookType["RESUME"] = "resume";
})(WebhookType || (exports.WebhookType = WebhookType = {}));
//# sourceMappingURL=webhook.model.js.map