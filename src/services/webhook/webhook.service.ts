import crypto from "crypto";
import { env } from "../../config/env";
import { WebhookPayload, WebhookEvent, WebhookType, WebhookStatus } from "../../models/webhook.model";

export class WebhookService {
  private baseURL: string;
  private secret: string;

  constructor() {
    this.baseURL = env.WEBHOOK_BASE_URL;
    this.secret = env.WEBHOOK_SECRET;
  }

  initiate(event: WebhookEvent, eventType: WebhookType, payloadOwner?: string): WebhookSession {
    const base = this.baseURL.endsWith(event) ? this.baseURL.slice(0, -event.length) : this.baseURL;
    const fullURL = `${base}${event}`;
    console.log("🔗 URL: ", fullURL);

    if (!base || !this.secret) {
      throw new Error(`webhook config is missing: base=${base} secret=${this.secret ? "***" : ""}`);
    }

    return new WebhookSession(fullURL, this.secret, event, eventType, payloadOwner);
  }
}

export class WebhookSession {
  constructor(
    private fullURL: string,
    private secret: string,
    private event: WebhookEvent,
    private typ: WebhookType,
    private payloadOwner?: string
  ) {}

  private async send(payload: WebhookPayload): Promise<void> {
    payload.event = this.event;
    payload.type = this.typ;
    payload.timestamp = new Date().toISOString();
    if (this.payloadOwner) {
      payload.payloadOwner = this.payloadOwner;
    }

    const body = JSON.stringify(payload);

    // Create HMAC signature
    const mac = crypto.createHmac("sha256", this.secret);
    mac.update(body);
    const signature = `sha256=${mac.digest("hex")}`;

    const response = await fetch(this.fullURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-signature": signature,
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`webhook ${response.status}: ${errorText}`);
    }
  }

  async start(msg?: string): Promise<void> {
    const payload: WebhookPayload = {
      event: this.event,
      type: this.typ,
      status: WebhookStatus.STARTED,
      timestamp: new Date().toISOString(),
    };

    if (msg) {
      payload.data = { msg };
    }

    return this.send(payload);
  }

  async running(): Promise<void> {
    return this.send({
      event: this.event,
      type: this.typ,
      status: WebhookStatus.RUNNING,
      timestamp: new Date().toISOString(),
    });
  }

  async success(data: any, msg?: string): Promise<void> {
    return this.send({
      event: this.event,
      type: this.typ,
      status: WebhookStatus.SUCCESS,
      data,
      message: msg,
      timestamp: new Date().toISOString(),
    });
  }

  async error(msg: string): Promise<void> {
    return this.send({
      event: this.event,
      type: this.typ,
      status: WebhookStatus.ERROR,
      error: msg,
      timestamp: new Date().toISOString(),
    });
  }
}

let instance: WebhookService | null = null;

export function getWebhookService(): WebhookService {
  if (!instance) instance = new WebhookService();
  return instance;
}
