import fs from "fs";
import path from "path";

let _cachedKnowledge: string | null = null;

export function getPopupTechniques(): string {
  if (_cachedKnowledge) return _cachedKnowledge;
  const filePath = path.join(process.cwd(), "knowledge", "techniques.md");
  _cachedKnowledge = fs.readFileSync(filePath, "utf-8");
  return _cachedKnowledge;
}
