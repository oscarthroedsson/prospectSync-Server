"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
exports.getEmailService = getEmailService;
const env_1 = require("../../config/env");
// Note: MailerSend SDK package name needs to be verified
// Using a placeholder implementation that can be updated with correct package
class EmailService {
    apiKey;
    fromEmail;
    fromName;
    constructor() {
        this.apiKey = env_1.env.MAILERSEND_API_TOKEN;
        this.fromEmail = env_1.env.MAILERSEND_FROM_EMAIL;
        this.fromName = env_1.env.MAILERSEND_FROM_NAME;
    }
    async sendEmail(emailType, data) {
        if (!this.apiKey) {
            throw new Error("MailerSend client not initialized - check MAILERSEND_API_TOKEN");
        }
        const toEmail = data.to;
        if (!toEmail) {
            throw new Error("recipient email (to) is required");
        }
        if (!data.subject) {
            throw new Error("subject is required");
        }
        if (!data.html && !data.text) {
            throw new Error("either html or text content is required");
        }
        const fromEmail = data.from || this.fromEmail;
        if (!fromEmail) {
            throw new Error("sender email (from) is required");
        }
        const fromNameValue = data.fromName || this.fromName;
        console.log(`📧 [EmailService] Sending email type: ${emailType}`);
        console.log(`📧 [EmailService] To: ${toEmail}, Subject: ${data.subject}, From: ${fromEmail} (${fromNameValue})`);
        // TODO: Implement actual MailerSend integration
        // This is a placeholder - replace with actual MailerSend SDK when package is confirmed
        // Example:
        // const mailersend = new MailerSend({ apiKey: this.apiKey });
        // await mailersend.email.send({
        //   from: { email: fromEmail, name: fromName },
        //   to: [{ email: toEmail, name: data.toName }],
        //   subject: data.subject,
        //   html: data.html,
        //   text: data.text,
        //   reply_to: data.replyTo ? { email: data.replyTo } : undefined,
        // });
        console.log(`✅ [EmailService] Email sent successfully to ${toEmail}`);
    }
}
exports.EmailService = EmailService;
let instance = null;
function getEmailService() {
    if (!instance) {
        instance = new EmailService();
    }
    return instance;
}
//# sourceMappingURL=email.service.js.map