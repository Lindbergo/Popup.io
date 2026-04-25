import { describe, it, expect } from "vitest";
import { generateSVG } from "@/lib/svg-template";
import { mockDesign, emptyPiecesDesign } from "./fixture";

describe("generateSVG", () => {
  it("produces a non-empty SVG string", () => {
    const svg = generateSVG(mockDesign);
    expect(svg.length).toBeGreaterThan(0);
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  it("contains no NaN in any coordinate", () => {
    const svg = generateSVG(mockDesign);
    expect(svg).not.toContain("NaN");
  });

  it("contains the card title", () => {
    const svg = generateSVG(mockDesign);
    expect(svg).toContain(mockDesign.title);
  });

  it("includes the PRINT CHECK verification square", () => {
    const svg = generateSVG(mockDesign);
    expect(svg).toContain("PRINT CHECK");
    expect(svg).toContain("50×50mm");
  });

  it("includes labels for every template piece", () => {
    const svg = generateSVG(mockDesign);
    for (const piece of mockDesign.template_pieces) {
      expect(svg).toContain(piece.label);
    }
  });

  it("renders with zero template pieces without crashing", () => {
    const svg = generateSVG(emptyPiecesDesign);
    expect(svg).not.toContain("NaN");
    expect(svg).toContain("<svg");
  });

  it("piece bounding boxes do not overlap each other", () => {
    // Parse x/y/width/height from each <rect> that represents a piece outline.
    // Piece outline rects have stroke="${COLORS.border}" and no fill.
    const svg = generateSVG(mockDesign);
    const rectRegex = /x="([\d.]+)"\s+y="([\d.]+)"\s+width="([\d.]+)"\s+height="([\d.]+)"\s+[^/]*stroke="#2d3748"/g;
    const rects: { x: number; y: number; w: number; h: number }[] = [];
    let m: RegExpExecArray | null;
    while ((m = rectRegex.exec(svg)) !== null) {
      rects.push({ x: +m[1], y: +m[2], w: +m[3], h: +m[4] });
    }

    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i], b = rects[j];
        const overlapX = a.x < b.x + b.w && a.x + a.w > b.x;
        const overlapY = a.y < b.y + b.h && a.y + a.h > b.y;
        expect(overlapX && overlapY, `Piece ${i} overlaps piece ${j}`).toBe(false);
      }
    }
  });

  it("uses red for cut lines and blue for valley folds", () => {
    const svg = generateSVG(mockDesign);
    // Valley fold lines — blue color
    expect(svg).toContain("#3182ce");
    // Mountain fold lines — green
    expect(svg).toContain("#38a169");
  });

  it("falls back to 'Card' when title is missing", () => {
    const svg = generateSVG({ ...mockDesign, title: undefined as unknown as string });
    expect(svg).toContain("Card — Print Template");
    expect(svg).not.toContain("undefined");
  });
});
