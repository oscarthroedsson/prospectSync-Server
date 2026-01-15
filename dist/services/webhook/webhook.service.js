"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookSession = exports.WebhookService = void 0;
exports.getWebhookService = getWebhookService;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../../config/env");
const webhook_model_1 = require("../../models/webhook.model");
class WebhookService {
    baseURL;
    secret;
    constructor() {
        this.baseURL = env_1.env.WEBHOOK_BASE_URL;
        this.secret = env_1.env.WEBHOOK_SECRET;
    }
    initiate(event, eventType, payloadOwner) {
        const base = this.baseURL.endsWith(event)
            ? this.baseURL.slice(0, -event.length)
            : this.baseURL;
        const fullURL = `${base}${event}`;
        if (!base || !this.secret) {
            throw new Error(`webhook config is missing: base=${base} secret=${this.secret ? "***" : ""}`);
        }
        return new WebhookSession(fullURL, this.secret, event, eventType, payloadOwner);
    }
}
exports.WebhookService = WebhookService;
class WebhookSession {
    fullURL;
    secret;
    event;
    typ;
    payloadOwner;
    constructor(fullURL, secret, event, typ, payloadOwner) {
        this.fullURL = fullURL;
        this.secret = secret;
        this.event = event;
        this.typ = typ;
        this.payloadOwner = payloadOwner;
    }
    async send(payload) {
        payload.event = this.event;
        payload.type = this.typ;
        payload.timestamp = new Date().toISOString();
        if (this.payloadOwner) {
            payload.payloadOwner = this.payloadOwner;
        }
        const body = JSON.stringify(payload);
        // Create HMAC signature
        const mac = crypto_1.default.createHmac("sha256", this.secret);
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
    async start(msg) {
        const payload = {
            event: this.event,
            type: this.typ,
            status: webhook_model_1.WebhookStatus.STARTED,
            timestamp: new Date().toISOString(),
        };
        if (msg) {
            payload.data = { msg };
        }
        return this.send(payload);
    }
    async running() {
        return this.send({
            event: this.event,
            type: this.typ,
            status: webhook_model_1.WebhookStatus.RUNNING,
            timestamp: new Date().toISOString(),
        });
    }
    async success(data, msg) {
        return this.send({
            event: this.event,
            type: this.typ,
            status: webhook_model_1.WebhookStatus.SUCCESS,
            data,
            message: msg,
            timestamp: new Date().toISOString(),
        });
    }
    async error(msg) {
        return this.send({
            event: this.event,
            type: this.typ,
            status: webhook_model_1.WebhookStatus.ERROR,
            error: msg,
            timestamp: new Date().toISOString(),
        });
    }
}
exports.WebhookSession = WebhookSession;
let instance = null;
function getWebhookService() {
    if (!instance) {
        instance = new WebhookService();
    }
    return instance;
}
//# sourceMappingURL=webhook.service.js.map