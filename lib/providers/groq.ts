import OpenAI from "openai";
import type { GenerateRequest, CardDesign } from "@/types/card";
import { AIProvider, SYSTEM_PROMPT, parseCardDesign, buildUserText } from "./shared";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Vision model when an image is provided; fast text model otherwise
const MODEL_TEXT   = "llama-3.3-70b-versatile";
const MODEL_VISION = "llama-3.2-90b-vision-preview";

export const groqProvider: AIProvider = {
  async generateCardDesign(request: GenerateRequest, techniques: string): Promise<CardDesign> {
    const hasImage = !!(request.imageBase64 && request.imageMimeType);
    const userContent: OpenAI.ChatCompletionContentPart[] = [];

    if (hasImage) {
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
      model: hasImage ? MODEL_VISION : MODEL_TEXT,
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
