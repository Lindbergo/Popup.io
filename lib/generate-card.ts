import Anthropic from "@anthropic-ai/sdk";
import { getPopupTechniques } from "./popup-knowledge";
import type { CardDesign, GenerateRequest } from "@/types/card";

const client = new Anthropic();

const SYSTEM_PROMPT_PREFIX = `You are a paper engineering expert specializing in pop-up cards. You have deep knowledge of all pop-up card mechanisms and always produce structurally correct, buildable designs.

You have been given a complete reference document of pop-up card techniques. You MUST only use mechanisms described in that document. Never invent mechanisms not listed there. Every design you produce must follow all geometric constraints and universal design rules in the reference.

When given a scene description or image, you:
1. Identify each scene element and map it to the best mechanism from the reference
2. Choose appropriate card size and paper weights from the specifications in the reference
3. Generate precise measurements (in mm) for every piece
4. Write clear, numbered assembly steps in the correct order
5. Generate template piece data for a printable SVG template

Your output must be a single valid JSON object matching this TypeScript type exactly:

{
  title: string,                          // Short card title, e.g. "Birthday Table for Two"
  concept: string,                        // 2-3 sentence description of the card design
  technique_summary: string,              // Which mechanisms are used and why
  difficulty: "beginner" | "intermediate" | "advanced",
  mechanisms_used: string[],              // Array of mechanism IDs from the reference
  card_size: {
    flat_width_mm: number,
    flat_height_mm: number,
    folded_width_mm: number,
    folded_height_mm: number
  },
  materials: [
    {
      piece: string,                      // Name of this piece
      width_mm: number,
      height_mm: number,
      weight_lb: number,                  // Paper weight
      color: string,                      // Suggested color
      quantity: number,
      notes: string                       // Optional assembly note
    }
  ],
  steps: [
    {
      step: number,
      title: string,                      // Short step title
      instruction: string,                // Detailed instruction
      mechanism: string,                  // Which mechanism this step relates to (optional)
      tip: string                         // Pro tip for this step (optional)
    }
  ],
  design_notes: string,                  // Any important notes about this design
  template_pieces: [
    {
      id: string,                         // Unique piece ID, e.g. "base-card", "table-top"
      label: string,                      // Human-readable label for the template
      x: number,                          // Position x on template sheet (mm from left)
      y: number,                          // Position y on template sheet (mm from top)
      width: number,                      // Piece width in mm
      height: number,                     // Piece height in mm
      foldLines: [
        { type: "valley"|"mountain"|"score", x1: number, y1: number, x2: number, y2: number }
      ],
      cutLines: [
        { x1: number, y1: number, x2: number, y2: number }
      ],
      glueZones: [
        { x: number, y: number, width: number, height: number }  // glue areas — spelled "glueZones" exactly
      ]
    }
  ]
}

Output ONLY the JSON. No markdown fences, no explanation text.`;

export async function generateCardDesign(
  request: GenerateRequest
): Promise<CardDesign> {
  const techniques = getPopupTechniques();

  const userContent: Anthropic.MessageParam["content"] = [];

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

  const difficultyNote = request.difficulty
    ? `\nTarget difficulty level: ${request.difficulty}.`
    : "";

  userContent.push({
    type: "text",
    text: `Design a pop-up card for the following:

${request.description}${difficultyNote}

Use the pop-up card techniques reference below to design a structurally correct card. Return only JSON.

---
${techniques}`,
  });

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: SYSTEM_PROMPT_PREFIX,
    messages: [{ role: "user", content: userContent }],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => (block as Anthropic.TextBlock).text)
    .join("");

  const cleaned = text.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(cleaned) as CardDesign;
}
