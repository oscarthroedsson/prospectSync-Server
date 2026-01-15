import { WebhookEvent, WebhookType } from "../../models/webhook.model";
export declare class WebhookService {
    private baseURL;
    private secret;
    constructor();
    initiate(event: WebhookEvent, eventType: WebhookType, payloadOwner?: string): WebhookSession;
}
export declare class WebhookSession {
    private fullURL;
    private secret;
    private event;
    private typ;
    private payloadOwner?;
    constructor(fullURL: string, secret: string, event: WebhookEvent, typ: WebhookType, payloadOwner?: string | undefined);
    private send;
    start(msg?: string): Promise<void>;
    running(): Promise<void>;
    success(data: any, msg?: string): Promise<void>;
    error(msg: string): Promise<void>;
}
export declare function getWebhookService(): WebhookService;
//# sourceMappingURL=webhook.service.d.ts.map