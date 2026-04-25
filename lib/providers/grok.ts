import OpenAI from "openai";
import type { GenerateRequest, CardDesign } from "@/types/card";
import { AIProvider, SYSTEM_PROMPT, parseCardDesign, buildUserText } from "./shared";

const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

export const grokProvider: AIProvider = {
  async generateCardDesign(request: GenerateRequest, techniques: string): Promise<CardDesign> {
    const userContent: OpenAI.ChatCompletionContentPart[] = [];

    if (request.imageBase64 && request.imageMimeType) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:${request.imageMimeType};base64,${request.imageBase64}`,
        },
      });
    }

    userContent.push({
      type: "text",
      text: `Techniques reference:\n\n${techniques}\n\n${buildUserText(request.description, request.difficulty)}`,
    });

    const response = await client.chat.completions.create({
      model: "grok-3-mini",
      max_tokens: 4096,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    });

    const text = response.choices[0]?.message?.content ?? "";
    return parseCardDesign(text);
  },
};
