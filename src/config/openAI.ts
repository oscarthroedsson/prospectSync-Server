import OpenAI from "openai";

import { env } from "./env";

console.info("🤖 AI initiated");
export const openAI = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});
