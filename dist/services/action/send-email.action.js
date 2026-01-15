"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeSendEmail = executeSendEmail;
const email_service_1 = require("../email/email.service");
const step_repository_1 = require("../../repositories/step.repository");
async function executeSendEmail(action) {
    const config = action.config;
    const emailService = (0, email_service_1.getEmailService)();
    const to = config.to;
    const subject = config.subject;
    const customEmail = config.email;
    const content = config.content;
    const replyTo = config.replyTo;
    if (!subject) {
        throw new Error("SEND_EMAIL - Subject is required");
    }
    if (!content) {
        throw new Error("SEND_EMAIL - Content is required");
    }
    // Resolve recipient email
    let recipientEmail = "";
    if (!to) {
        if (customEmail) {
            recipientEmail = customEmail;
        }
        else {
            throw new Error("no recipient specified (to is empty and email is empty)");
        }
    }
    else {
        const toUpper = to.toUpperCase();
        switch (toUpper) {
            case "CUSTOM":
                if (!customEmail) {
                    throw new Error("CUSTOM recipient type requires email field to be set");
                }
                recipientEmail = customEmail;
                break;
            case "PROCESS_OWNER":
                if (!action.stepId) {
                    throw new Error("PROCESS_OWNER recipient type requires stepID");
                }
                const stepRepo = (0, step_repository_1.getStepRepository)();
                const userEmail = await stepRepo.getUserEmailByStepID(action.stepId);
                if (!userEmail) {
                    throw new Error(`no user email found for step ${action.stepId}`);
                }
                recipientEmail = userEmail;
                break;
            case "COUNTERPART":
                throw new Error("COUNTERPART recipient type not yet implemented");
            case "ALL_COUNTERPARTS":
                throw new Error("ALL_COUNTERPARTS recipient type not yet implemented");
            case "SYSTEM":
                throw new Error("SYSTEM recipient type not yet implemented");
            default:
                throw new Error(`unknown recipient type: ${to}`);
        }
    }
    console.log(`📧 [ActionExecutor] SEND_EMAIL - To: ${to}, Email: ${recipientEmail}, Subject: ${subject}`);
    await emailService.sendEmail("SEND_EMAIL", {
        to: recipientEmail,
        subject,
        html: content,
        text: content,
        replyTo: replyTo || undefined,
    });
    console.log(`✅ [ActionExecutor] SEND_EMAIL - Email sent successfully to ${recipientEmail}`);
}
//# sourceMappingURL=send-email.action.js.map