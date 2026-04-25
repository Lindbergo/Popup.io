import { getProvider } from "./providers";
import { getPopupTechniques } from "./popup-knowledge";
import type { CardDesign, GenerateRequest } from "@/types/card";

export async function generateCardDesign(request: GenerateRequest): Promise<CardDesign> {
  const provider = getProvider();
  const techniques = getPopupTechniques(request.description);
  return provider.generateCardDesign(request, techniques);
}
