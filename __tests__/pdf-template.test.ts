import { describe, it, expect } from "vitest";
import { generatePDF } from "@/lib/pdf-template";
import { mockDesign, emptyPiecesDesign } from "./fixture";

describe("generatePDF", () => {
  it("produces a valid PDF binary (starts with %PDF-)", async () => {
    const bytes = await generatePDF(mockDesign);
    const header = Buffer.from(bytes.slice(0, 5)).toString("ascii");
    expect(header).toBe("%PDF-");
  });

  it("produces a non-trivial file size (> 1KB)", async () => {
    const bytes = await generatePDF(mockDesign);
    expect(bytes.length).toBeGreaterThan(1_000);
  });

  it("does not throw with zero template pieces", async () => {
    await expect(generatePDF(emptyPiecesDesign)).resolves.toBeDefined();
  });

  it("produces a larger file when there are more pieces", async () => {
    const extraPiece = { ...mockDesign.template_pieces[1], id: "chair-right", label: "Right Chair" };
    const richDesign = {
      ...mockDesign,
      template_pieces: [...mockDesign.template_pieces, extraPiece],
    };
    const baseBytes  = await generatePDF(mockDesign);
    const richBytes  = await generatePDF(richDesign);
    expect(richBytes.length).toBeGreaterThan(baseBytes.length);
  });
});
