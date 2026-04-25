import type { CardDesign } from "@/types/card";

// Minimal valid CardDesign used across all tests.
// Covers one box-fold piece and one V-fold piece so layout logic is exercised.
export const mockDesign: CardDesign = {
  title: "Test Birthday Card",
  concept: "A table pops up with two chairs.",
  technique_summary: "Box fold for the table, V-fold for each chair.",
  difficulty: "intermediate",
  mechanisms_used: ["box-fold", "v-fold"],
  card_size: {
    flat_width_mm: 216,
    flat_height_mm: 140,
    folded_width_mm: 108,
    folded_height_mm: 140,
  },
  materials: [
    {
      piece: "Base card",
      width_mm: 216,
      height_mm: 140,
      weight_lb: 110,
      color: "cream",
      quantity: 1,
    },
    {
      piece: "Chair piece",
      width_mm: 50,
      height_mm: 90,
      weight_lb: 80,
      color: "brown",
      quantity: 2,
    },
  ],
  steps: [
    { step: 1, title: "Score base card", instruction: "Score at 108mm from the left edge." },
    { step: 2, title: "Cut table box fold", instruction: "Make two 30mm parallel cuts from the gutter." },
  ],
  design_notes: "Ensure chairs are attached at least 40mm from the gutter.",
  template_pieces: [
    {
      id: "base-card",
      label: "Base Card",
      x: 0,
      y: 0,
      width: 216,
      height: 140,
      foldLines: [{ type: "valley", x1: 108, y1: 0, x2: 108, y2: 140 }],
      cutLines: [],
      glueZones: [],
    },
    {
      id: "chair-left",
      label: "Left Chair",
      x: 0,
      y: 0,
      width: 50,
      height: 90,
      foldLines: [
        { type: "valley", x1: 25, y1: 0, x2: 25, y2: 90 },
        { type: "mountain", x1: 0, y1: 65, x2: 50, y2: 65 },
      ],
      cutLines: [],
      glueZones: [{ x: 0, y: 70, width: 50, height: 10 }],
    },
  ],
  photo_placements: [
    {
      piece_id: "chair-left",
      piece_label: "Left Chair",
      print_width_mm: 46,
      print_height_mm: 61,
      position_on_piece: "centred on chair back",
      attach_at_step: 8,
      notes: "Trim to fit before gluing.",
    },
  ],
};

// Design with zero template pieces — exercises empty-state edge cases.
export const emptyPiecesDesign: CardDesign = {
  ...mockDesign,
  title: "Empty Pieces Card",
  template_pieces: [],
};
