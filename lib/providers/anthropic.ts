import Anthropic from "@anthropic-ai/sdk";
import type { GenerateRequest, CardDesign } from "@/types/card";
import { AIProvider, SYSTEM_PROMPT, parseCardDesign, buildUserText } from "./shared";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const anthropicProvider: AIProvider = {
  async generateCardDesign(request: GenerateRequest, techniques: string): Promise<CardDesign> {
    // Build content array — techniques block is marked for caching (static across all requests)
    const userContent: Anthropic.ContentBlockParam[] = [];

    if (request.imageBase64 && request.imageMimeType) {
      userContent.push({
        type: "image",
        source: {
          type: "base64",
          media_type: request.imageMimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: request.imageBase64,
        },
      });
    }

    // Techniques block — cached at Anthropic's side after first request
    userContent.push({
      type: "text",
      text: `Techniques reference:\n\n${techniques}`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cache_control: { type: "ephemeral" } as any,
    });

    // The unique per-request part — never cached
    userContent.push({
      type: "text",
      text: buildUserText(request.description, request.difficulty),
    });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as Anthropic.TextBlock).text)
      .join("");

    return parseCardDesign(text);
  },
};
