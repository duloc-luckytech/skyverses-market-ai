import OpenAI from "openai";

const CLIENT_MAP: Record<
  string,
  { baseURL?: string; keyEnv: string }
> = {
  deepseek: {
    keyEnv: "DEEPSEEK_API_KEY",
    baseURL: "https://api.deepseek.com",
  },
  openai: {
    keyEnv: "OPENAI_API_KEY",
  },
  claude: {
    keyEnv: "ANTHROPIC_API_KEY",
    baseURL: "https://api.anthropic.com",
  },
  gemini: {
    keyEnv: "GOOGLE_API_KEY",
    baseURL: "https://generativelanguage.googleapis.com",
  },
};

export function getAIClient(model: string = "deepseek") {
  const cfg = CLIENT_MAP[model];

  if (!cfg) throw new Error("Model not supported: " + model);

  const apiKey = process.env[cfg.keyEnv];
  if (!apiKey) throw new Error(`Missing API KEY for ${model}: ${cfg.keyEnv}`);

  return new OpenAI({
    apiKey,
    baseURL: cfg.baseURL,
  });
}