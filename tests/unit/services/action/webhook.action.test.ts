import { executeWebhook } from "../../../../src/services/action/webhook.action";
import { ActionDefinition } from "../../../../src/models/action.model";

// Mock global fetch
global.fetch = jest.fn();

describe("Webhook Action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should make POST request with payload", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "step-1",
      name: "Webhook",
      isPublic: true,
      order: 1,
      config: {
        type: "WEBHOOK",
        url: "https://example.com/webhook",
        method: "POST",
        payload: { key: "value" },
      },
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue("OK"),
    });

    await executeWebhook(action);

    expect(global.fetch).toHaveBeenCalledWith("https://example.com/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key: "value" }),
    });
  });

  it("should include custom headers", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "step-1",
      name: "Webhook",
      isPublic: true,
      order: 1,
      config: {
        type: "WEBHOOK",
        url: "https://example.com/webhook",
        method: "POST",
        headers: {
          Authorization: "Bearer token",
          "X-Custom": "value",
        },
        payload: {},
      },
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue("OK"),
    });

    await executeWebhook(action);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://example.com/webhook",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer token",
          "X-Custom": "value",
        }),
      })
    );
  });

  it("should use GET method when specified", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "step-1",
      name: "Webhook",
      isPublic: true,
      order: 1,
      config: {
        type: "WEBHOOK",
        url: "https://example.com/webhook",
        method: "GET",
      },
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue("OK"),
    });

    await executeWebhook(action);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://example.com/webhook",
      expect.objectContaining({
        method: "GET",
      })
    );
  });

  it("should default to POST when method not specified", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "step-1",
      name: "Webhook",
      isPublic: true,
      order: 1,
      config: {
        type: "WEBHOOK",
        url: "https://example.com/webhook",
      },
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue("OK"),
    });

    await executeWebhook(action);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://example.com/webhook",
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  it("should throw error when URL is missing", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "step-1",
      name: "Webhook",
      isPublic: true,
      order: 1,
      config: {
        type: "WEBHOOK",
        method: "POST",
      },
    };

    await expect(executeWebhook(action)).rejects.toThrow("URL is required");
  });

  it("should throw error when request fails", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "step-1",
      name: "Webhook",
      isPublic: true,
      order: 1,
      config: {
        type: "WEBHOOK",
        url: "https://example.com/webhook",
        method: "POST",
      },
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: jest.fn().mockResolvedValue("Error message"),
    });

    await expect(executeWebhook(action)).rejects.toThrow("Webhook request failed");
  });
});
