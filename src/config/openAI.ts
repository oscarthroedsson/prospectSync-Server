import OpenAI from "openai";

import { env } from "./env";

console.info("🤖 AI initiated");
export const openAI = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  timeout: 300_000, // 5min timeout for API calls
  maxRetries: 2, // Retry failed requests up to 2 times
});
