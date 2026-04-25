import type { AIProvider } from "./shared";

export function getProvider(): AIProvider {
  if (process.env.XAI_API_KEY) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("./grok").grokProvider as AIProvider;
  }
  if (process.env.ANTHROPIC_API_KEY) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("./anthropic").anthropicProvider as AIProvider;
  }
  throw new Error(
    "No AI provider configured. Set XAI_API_KEY (Grok, free) or ANTHROPIC_API_KEY (Claude) in your .env.local file."
  );
}

export type { AIProvider };
