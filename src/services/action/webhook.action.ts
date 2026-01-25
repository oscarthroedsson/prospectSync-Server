import { ActionDefinition } from "../../Types/action.types";

export async function executeWebhook(action: ActionDefinition): Promise<void> {
  const config = action.config;

  const url = config.url as string;
  const method = (config.method as string) || "POST";
  const headers = (config.headers as Record<string, string>) || {};
  const payload = config.payload || {};

  if (!url) {
    throw new Error("WEBHOOK - URL is required");
  }

  console.log(`🔗 [ActionExecutor] WEBHOOK - URL: ${url}, Method: ${method}`);

  try {
    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    // Add body for methods that support it
    if (["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
      fetchOptions.body = JSON.stringify(payload);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webhook request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responseData = await response.text();
    console.log(
      `✅ [ActionExecutor] WEBHOOK - Successfully sent to ${url}, Response: ${responseData.substring(0, 100)}`,
    );
  } catch (error: any) {
    console.error(`❌ [ActionExecutor] WEBHOOK - Error calling ${url}:`, error);
    throw new Error(`Failed to execute webhook: ${error.message}`);
  }
}
