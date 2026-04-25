import { describe, it, expect } from "vitest";
import { parseCardDesign } from "@/lib/providers/shared";
import { mockDesign } from "./fixture";

describe("parseCardDesign", () => {
  it("parses a valid complete JSON string", () => {
    const result = parseCardDesign(JSON.stringify(mockDesign));
    expect(result.title).toBe(mockDesign.title);
    expect(result.steps.length).toBe(mockDesign.steps.length);
  });

  it("strips markdown code fences before parsing", () => {
    const fenced = "```json\n" + JSON.stringify(mockDesign) + "\n```";
    const result = parseCardDesign(fenced);
    expect(result.title).toBe(mockDesign.title);
  });

  it("throws a readable error on empty input", () => {
    expect(() => parseCardDesign("")).toThrowError(/empty response/i);
  });

  it("throws a readable error on whitespace-only input", () => {
    expect(() => parseCardDesign("   \n  ")).toThrowError(/empty response/i);
  });

  it("throws a readable error on malformed JSON", () => {
    expect(() => parseCardDesign("{title: missing quotes}")).toThrowError(/could not be parsed/i);
  });

  it("throws a readable error when required fields are missing", () => {
    const incomplete = JSON.stringify({ title: "Oops" }); // missing steps and materials
    expect(() => parseCardDesign(incomplete)).toThrowError(/incomplete/i);
  });

  it("throws a readable error when steps field is missing", () => {
    const noSteps = JSON.stringify({ ...mockDesign, steps: undefined });
    expect(() => parseCardDesign(noSteps)).toThrowError(/incomplete/i);
  });

  it("throws a readable error when materials field is missing", () => {
    const noMaterials = JSON.stringify({ ...mockDesign, materials: undefined });
    expect(() => parseCardDesign(noMaterials)).toThrowError(/incomplete/i);
  });

  it("does not throw when photo_placements is absent (it is optional)", () => {
    const noPhotos = JSON.stringify({ ...mockDesign, photo_placements: undefined });
    expect(() => parseCardDesign(noPhotos)).not.toThrow();
  });
});
