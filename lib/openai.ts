import OpenAI from "openai";

let client: OpenAI | null = null;

export function hasOpenAiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function getOpenAiClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY ist nicht konfiguriert.");
  }
  if (!client) {
    client = new OpenAI({ apiKey });
  }
  return client;
}
