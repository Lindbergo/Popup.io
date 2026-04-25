import fs from "fs";
import path from "path";

// Always included — cover the most common techniques and all design rules
const CORE_FILES = [
  "index.md",
  "_shared.md",
  "v-fold.md",
  "box-fold.md",
  "clearance-rules.md",
  "character-shapes.md",
  "photo-placement-sizing.md",
];

// Included only when the description contains matching keywords
const OPTIONAL_FILES: { file: string; keywords: string[] }[] = [
  { file: "floating-layer.md",  keywords: ["float", "layer", "hover", "above", "cloud", "sky", "platform"] },
  { file: "angle-v-fold.md",    keywords: ["angle", "diagonal", "lean", "tilt", "slant", "angled"] },
  { file: "moving-arm.md",      keywords: ["arm", "wave", "swing", "windmill", "flap", "flag", "waving"] },
  { file: "sliding-motion.md",  keywords: ["slide", "pull", "reveal", "tab", "hidden", "secret", "sliding"] },
  { file: "rotating-disc.md",   keywords: ["rotat", "spin", "wheel", "disc", "disk", "circle", "turn"] },
  { file: "tunnel-layers.md",   keywords: ["tunnel", "forest", "corridor", "diorama", "background", "depth"] },
  { file: "pop-up-text.md",     keywords: ["text", "letter", "word", "message", "birthday text", "greeting"] },
];

let _cachedFull: string | null = null;

function readFile(dir: string, filename: string): string {
  try {
    return fs.readFileSync(path.join(dir, filename), "utf-8");
  } catch {
    throw new Error(`Missing knowledge file: knowledge/techniques/${filename}. Check the file exists in the repo.`);
  }
}

export function getPopupTechniques(description?: string): string {
  const dir = path.join(process.cwd(), "knowledge", "techniques");

  if (!description) {
    // No description — return full knowledge base (used by tests and fallback)
    if (_cachedFull) return _cachedFull;
    const all = [...CORE_FILES, ...OPTIONAL_FILES.map((o) => o.file)];
    _cachedFull = all.map((f) => readFile(dir, f)).join("\n\n---\n\n");
    return _cachedFull;
  }

  const lower = description.toLowerCase();
  const selected = [
    ...CORE_FILES,
    ...OPTIONAL_FILES.filter((o) => o.keywords.some((kw) => lower.includes(kw))).map((o) => o.file),
  ];

  return selected.map((f) => readFile(dir, f)).join("\n\n---\n\n");
}
