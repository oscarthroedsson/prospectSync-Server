export declare class EmailService {
    private apiKey;
    private fromEmail;
    private fromName;
    constructor();
    sendEmail(emailType: string, data: {
        to: string;
        toName?: string;
        from?: string;
        fromName?: string;
        subject: string;
        html?: string;
        text?: string;
        replyTo?: string;
    }): Promise<void>;
}
export declare function getEmailService(): EmailService;
//# sourceMappingURL=email.service.d.ts.map