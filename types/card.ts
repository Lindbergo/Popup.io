export type Difficulty = "beginner" | "intermediate" | "advanced";

export type Mechanism =
  | "v-fold"
  | "box-fold"
  | "floating-layer"
  | "angle-v-fold"
  | "moving-arm"
  | "sliding-motion"
  | "rotating-disc"
  | "tunnel-layers"
  | "pop-up-text";

export interface Material {
  piece: string;
  width_mm: number;
  height_mm: number;
  weight_lb: number;
  color: string;
  quantity: number;
  notes?: string;
}

export interface AssemblyStep {
  step: number;
  title: string;
  instruction: string;
  mechanism?: Mechanism;
  tip?: string;
}

export interface TemplatePiece {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  foldLines: FoldLine[];
  cutLines: CutLine[];
  glueZones: GlueZone[];
}

export interface FoldLine {
  type: "valley" | "mountain" | "score";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface CutLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface GlueZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CardDesign {
  title: string;
  concept: string;
  technique_summary: string;
  difficulty: Difficulty;
  mechanisms_used: Mechanism[];
  card_size: {
    flat_width_mm: number;
    flat_height_mm: number;
    folded_width_mm: number;
    folded_height_mm: number;
  };
  materials: Material[];
  steps: AssemblyStep[];
  design_notes: string;
  template_pieces: TemplatePiece[];
}

export interface GenerateRequest {
  description: string;
  imageBase64?: string;
  imageMimeType?: string;
  difficulty?: Difficulty;
}
