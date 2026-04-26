import type { CardDesign } from "@/types/card";

export interface PhotoSlot {
  id: string;       // matches the piece.id that receives this photo
  label: string;    // shown in the UI, e.g. "Person on left chair"
  hint: string;     // e.g. "Portrait, face and shoulders"
}

export interface ParamField {
  key: string;
  label: string;
  unit?: string;
  type: "range" | "select";
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
}

export interface SceneValidation {
  ok: boolean;
  warnings: string[];
}

export type SceneParams = Record<string, number | string>;

export interface Scene<P extends SceneParams = SceneParams> {
  id: string;
  name: string;
  description: string;
  emoji: string;
  defaultParams: P;
  paramSchema: ParamField[];
  photoSlots: PhotoSlot[];
  validate: (params: P) => SceneValidation;
  generate: (params: P) => CardDesign;
}
