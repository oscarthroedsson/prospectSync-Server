import { env } from "./env";
import OpenAI from "openai";

console.info("🤖 AI initiated");
export const openAI = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});
