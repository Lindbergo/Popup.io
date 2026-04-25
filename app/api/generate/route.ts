import { NextRequest, NextResponse } from "next/server";
import { generateCardDesign } from "@/lib/generate-card";
import type { GenerateRequest } from "@/types/card";

// Vercel Hobby plan max; AI calls regularly take 20-40s
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateRequest;

    if (!body.description?.trim()) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const design = await generateCardDesign(body);
    return NextResponse.json(design);
  } catch (err) {
    console.error("Generate error:", err);
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
