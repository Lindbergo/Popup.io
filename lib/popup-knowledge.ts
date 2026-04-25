import fs from "fs";
import path from "path";

let _cachedKnowledge: string | null = null;

export function getPopupTechniques(): string {
  if (_cachedKnowledge) return _cachedKnowledge;

  const dir = path.join(process.cwd(), "knowledge", "techniques");

  // Load in a fixed order: index first, shared rules second, then individual techniques
  const order = [
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
  ];

  const sections = order.map((filename) => {
    const filePath = path.join(dir, filename);
    return fs.readFileSync(filePath, "utf-8");
  });

  _cachedKnowledge = sections.join("\n\n---\n\n");
  return _cachedKnowledge;
}
