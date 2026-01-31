import { URL } from "url";

/**
 * Validates webhook URLs to prevent SSRF attacks
 * @param urlString URL to validate
 * @returns true if URL is allowed, false otherwise
 */
export function isAllowedWebhookURL(
  urlString: string,
  msg: string = "[isAllowedWebhookURL] Unspecified Error",
): boolean {
  try {
    const url = new URL(urlString);
    const isDev = process.env.NODE_ENV !== "production";

    // Only allow http/https protocols
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Only allow http/https protocols are a loud");
    }

    // Dev mode: allow localhost and internal IPs for testing
    if (isDev) return true;

    // Block private/internal IP ranges in production
    const blockedPatterns = [
      /^127\./, // localhost (127.0.0.0/8)
      /^10\./, // Private Class A (10.0.0.0/8)
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private Class B (172.16.0.0/12)
      /^192\.168\./, // Private Class C (192.168.0.0/16)
      /^169\.254\./, // Link-local (169.254.0.0/16) - AWS metadata!
      /^localhost$/i, // localhost hostname
      /^0\.0\.0\.0$/, // All interfaces
      /^\[::\]$/, // IPv6 localhost
      /^::1$/, // IPv6 localhost
    ];

    if (blockedPatterns.some((regex) => regex.test(url.hostname))) {
      throw new Error(msg);
    }

    return true;
  } catch {
    // Invalid URL format
    return false;
  }
}
