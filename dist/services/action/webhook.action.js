"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeWebhook = executeWebhook;
async function executeWebhook(action) {
    const config = action.config;
    const url = config.url;
    const method = config.method || "POST";
    const headers = config.headers || {};
    const payload = config.payload || {};
    if (!url) {
        throw new Error("WEBHOOK - URL is required");
    }
    console.log(`🔗 [ActionExecutor] WEBHOOK - URL: ${url}, Method: ${method}`);
    try {
        const fetchOptions = {
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
        console.log(`✅ [ActionExecutor] WEBHOOK - Successfully sent to ${url}, Response: ${responseData.substring(0, 100)}`);
    }
    catch (error) {
        console.error(`❌ [ActionExecutor] WEBHOOK - Error calling ${url}:`, error);
        throw new Error(`Failed to execute webhook: ${error.message}`);
    }
}
//# sourceMappingURL=webhook.action.js.map