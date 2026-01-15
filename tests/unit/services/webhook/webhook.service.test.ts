import { WebhookService, WebhookSession } from "../../../../src/services/webhook/webhook.service";
import { WebhookEvent, WebhookType, WebhookStatus } from "../../../../src/models/webhook.model";
import crypto from "crypto";

// Mock global fetch
global.fetch = jest.fn();

describe("WebhookService", () => {
  let service: WebhookService;

  beforeEach(() => {
    process.env.WEBHOOK_BASE_URL = "http://localhost:3001";
    process.env.WEBHOOK_SECRET = "test-secret";
    service = new WebhookService();
    jest.clearAllMocks();
  });

  describe("initiate", () => {
    it("should create webhook session", () => {
      const session = service.initiate(
        WebhookEvent.SCAN,
        WebhookType.JOB_POSTING,
        "user-123"
      );

      expect(session).toBeInstanceOf(WebhookSession);
    });

    it("should throw error when config is missing", () => {
      process.env.WEBHOOK_BASE_URL = "";
      process.env.WEBHOOK_SECRET = "";

      expect(() => {
        service.initiate(WebhookEvent.SCAN, WebhookType.JOB_POSTING);
      }).toThrow("webhook config is missing");
    });
  });
});

describe("WebhookSession", () => {
  let session: WebhookSession;
  const secret = "test-secret";
  const fullURL = "http://localhost:3001/scan";

  beforeEach(() => {
    session = new WebhookSession(
      fullURL,
      secret,
      WebhookEvent.SCAN,
      WebhookType.JOB_POSTING,
      "user-123"
    );
    jest.clearAllMocks();
  });

  describe("start", () => {
    it("should send start webhook", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue("OK"),
      });

      await session.start("Starting scan");

      expect(global.fetch).toHaveBeenCalledWith(
        fullURL,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "x-webhook-signature": expect.any(String),
          }),
        })
      );

      const callBody = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1].body
      );
      expect(callBody.status).toBe(WebhookStatus.STARTED);
      expect(callBody.event).toBe(WebhookEvent.SCAN);
      expect(callBody.type).toBe(WebhookType.JOB_POSTING);
      expect(callBody.payloadOwner).toBe("user-123");
    });

    it("should include HMAC signature", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue("OK"),
      });

      await session.start();

      const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
      const signature = headers["x-webhook-signature"];

      expect(signature).toMatch(/^sha256=/);
      expect(signature.length).toBeGreaterThan(10);
    });
  });

  describe("success", () => {
    it("should send success webhook with data", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue("OK"),
      });

      const data = { jobId: "job-1", title: "Test Job" };
      await session.success(data, "Scan completed");

      const callBody = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1].body
      );
      expect(callBody.status).toBe(WebhookStatus.SUCCESS);
      expect(callBody.data).toEqual(data);
      expect(callBody.message).toBe("Scan completed");
    });
  });

  describe("error", () => {
    it("should send error webhook", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue("OK"),
      });

      await session.error("Scan failed");

      const callBody = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1].body
      );
      expect(callBody.status).toBe(WebhookStatus.ERROR);
      expect(callBody.error).toBe("Scan failed");
    });
  });

  describe("running", () => {
    it("should send running webhook", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue("OK"),
      });

      await session.running();

      const callBody = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1].body
      );
      expect(callBody.status).toBe(WebhookStatus.RUNNING);
    });
  });

  describe("HMAC signature", () => {
    it("should generate correct HMAC signature", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue("OK"),
      });

      await session.start();

      const callBody = (global.fetch as jest.Mock).mock.calls[0][1].body;
      const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
      const signature = headers["x-webhook-signature"];

      // Verify signature
      const mac = crypto.createHmac("sha256", secret);
      mac.update(callBody);
      const expectedSignature = `sha256=${mac.digest("hex")}`;

      expect(signature).toBe(expectedSignature);
    });
  });

  describe("error handling", () => {
    it("should throw error when webhook request fails", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: jest.fn().mockResolvedValue("Server error"),
      });

      await expect(session.start()).rejects.toThrow("webhook 500");
    });
  });
});
