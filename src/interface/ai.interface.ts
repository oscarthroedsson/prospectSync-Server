import OpenAI from "openai";

// Extract model type from the ChatCompletionCreateParams
export type OpenAIModel = OpenAI.ChatCompletionCreateParams["model"];
