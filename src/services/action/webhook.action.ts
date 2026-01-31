import { ActionDefinition } from "../../Types/action.types";
import { isAllowedWebhookURL } from "../../utils/url-validator";
import { logger } from "../../config/logger";

export async function executeWebhook(action: ActionDefinition): Promise<void> {
  const config = action.config;

  const url = config.url as string;
  const method = (config.method as string) || "POST";
  const headers = (config.headers as Record<string, string>) || {};
  const payload = config.payload || {};

  if (!url) throw new Error("WEBHOOK - URL is required");

  isAllowedWebhookURL(
    url,
    "WEBHOOK - URL is not allowed (private IP, localhost, or invalid protocol). This prevents SSRF attacks.",
  );

  logger.info("Executing webhook", { url, method });

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      signal: controller.signal,
    };

    // Add body for methods that support it
    if (["POST", "PUT", "PATCH"].includes(method.toUpperCase())) fetchOptions.body = JSON.stringify(payload);

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webhook request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responseData = await response.text();
    logger.info("Webhook executed successfully", {
      url,
      status: response.status,
      responsePreview: responseData.substring(0, 100),
    });
  } catch (error: any) {
    logger.error("Webhook execution failed", {
      url,
      error: error.message,
    });
    throw new Error(`Failed to execute webhook: ${error.message}`);
  } finally {
    clearTimeout(timeout);
  }
}
