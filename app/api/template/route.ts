import { NextRequest, NextResponse } from "next/server";
import { generateSVG } from "@/lib/svg-template";
import type { CardDesign } from "@/types/card";

export async function POST(req: NextRequest) {
  try {
    const design = (await req.json()) as CardDesign;
    const svg = generateSVG(design);
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="${design.title.replace(/\s+/g, "-")}-template.svg"`,
      },
    });
  } catch (err) {
    console.error("Template error:", err);
    return NextResponse.json({ error: "Template generation failed" }, { status: 500 });
  }
}
