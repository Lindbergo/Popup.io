import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import path from "path";

describe("getPopupTechniques (real files)", () => {
  // Reset the module cache between tests so the in-memory cache is cleared
  beforeEach(() => {
    vi.resetModules();
  });

  it("loads and returns a non-empty string", async () => {
    const { getPopupTechniques } = await import("@/lib/popup-knowledge");
    const result = getPopupTechniques();
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(100);
  });

  it("contains content from the index file", async () => {
    const { getPopupTechniques } = await import("@/lib/popup-knowledge");
    const result = getPopupTechniques();
    expect(result).toContain("V-Fold");
    expect(result).toContain("Box Fold");
  });

  it("contains the universal design rules", async () => {
    const { getPopupTechniques } = await import("@/lib/popup-knowledge");
    const result = getPopupTechniques();
    expect(result).toContain("Universal Design Rules");
  });

  it("contains clearance rules", async () => {
    const { getPopupTechniques } = await import("@/lib/popup-knowledge");
    const result = getPopupTechniques();
    expect(result).toContain("Clearance Rules");
  });

  it("contains photo placement sizing guidance", async () => {
    const { getPopupTechniques } = await import("@/lib/popup-knowledge");
    const result = getPopupTechniques();
    expect(result).toContain("Minimum Readable Face Size");
  });

  it("contains character shapes guidance", async () => {
    const { getPopupTechniques } = await import("@/lib/popup-knowledge");
    const result = getPopupTechniques();
    expect(result).toContain("Character Shapes");
  });

  it("joins sections with a separator", async () => {
    const { getPopupTechniques } = await import("@/lib/popup-knowledge");
    const result = getPopupTechniques();
    expect(result).toContain("---");
  });
});

describe("getPopupTechniques (missing file)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("throws an error naming the missing file when a knowledge file does not exist", async () => {
    // Store original before spyOn replaces it — avoids infinite recursion in the mock
    const original = fs.readFileSync.bind(fs);

    vi.spyOn(fs, "readFileSync").mockImplementation((filePath, ...args) => {
      if (typeof filePath === "string" && filePath.includes("v-fold.md")) {
        throw new Error("ENOENT: no such file or directory");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return original(filePath as any, ...args as any);
    });

    const { getPopupTechniques } = await import("@/lib/popup-knowledge");

    expect(() => getPopupTechniques()).toThrowError(/v-fold\.md/);

    vi.restoreAllMocks();
  });
});

describe("all expected technique files exist on disk", () => {
  const techniqueDir = path.join(process.cwd(), "knowledge", "techniques");
  const expectedFiles = [
    "index.md",
    "_shared.md",
    "v-fold.md",
    "box-fold.md",
    "floating-layer.md",
    "angle-v-fold.md",
    "moving-arm.md",
    "sliding-motion.md",
    "rotating-disc.md",
    "tunnel-layers.md",
    "pop-up-text.md",
    "clearance-rules.md",
    "character-shapes.md",
    "photo-placement-sizing.md",
  ];

  for (const filename of expectedFiles) {
    it(`knowledge/techniques/${filename} exists`, () => {
      const exists = fs.existsSync(path.join(techniqueDir, filename));
      expect(exists, `${filename} is missing from disk`).toBe(true);
    });
  }
});
