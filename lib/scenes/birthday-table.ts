import type { CardDesign, TemplatePiece, AssemblyStep, Material } from "@/types/card";
import type { Scene, SceneValidation } from "./types";

const CARD_SIZES = {
  a5: { halfWidthMm: 148, heightMm: 210, label: "A5 (folded A4)" },
  a6: { halfWidthMm: 105, heightMm: 148, label: "A6 (folded A5)" },
} as const;

type CardSizeKey = keyof typeof CARD_SIZES;

export interface BirthdayTableParams extends Record<string, number | string> {
  cardSize: CardSizeKey;
  tableWidthMm: number;
  tableDepthMm: number;
  chairWidthMm: number;
}

// Chair proportions are derived from chair width so the user only controls one slider
function chairDims(chairWidthMm: number) {
  return {
    backHeight: Math.round(chairWidthMm * 1.3),
    seatDepth:  Math.round(chairWidthMm * 0.5),
  };
}

function makeTable(tableWidthMm: number, tableDepthMm: number): TemplatePiece {
  const glueH = 4;
  return {
    id: "table",
    label: "Table (cut 1) — box fold strip",
    x: 0, y: 0,
    width:  tableWidthMm,
    height: tableDepthMm * 2,
    foldLines: [
      { type: "valley", x1: 0, y1: tableDepthMm, x2: tableWidthMm, y2: tableDepthMm },
    ],
    cutLines: [],
    glueZones: [
      { x: 0, y: 0,                             width: tableWidthMm, height: glueH },
      { x: 0, y: tableDepthMm * 2 - glueH,      width: tableWidthMm, height: glueH },
    ],
  };
}

function makeChair(
  id: "chair-left" | "chair-right",
  label: string,
  chairWidthMm: number,
  backHeight: number,
  seatDepth: number,
): TemplatePiece {
  const glueH = 4;
  const photoMargin = 4;
  const totalHeight = backHeight + seatDepth;
  return {
    id,
    label,
    x: 0, y: 0,
    width:  chairWidthMm,
    height: totalHeight,
    foldLines: [
      // Valley fold where the seat meets the chair back
      { type: "valley", x1: 0, y1: backHeight, x2: chairWidthMm, y2: backHeight },
    ],
    cutLines: [],
    glueZones: [
      // Bottom strip — glued to the card panel
      { x: 0, y: totalHeight - glueH, width: chairWidthMm, height: glueH },
    ],
    photo_zone: {
      x: photoMargin,
      y: photoMargin,
      width:  chairWidthMm  - photoMargin * 2,
      height: backHeight    - photoMargin * 2 - 5,
    },
  };
}

function makeSteps(
  p: BirthdayTableParams,
  card: typeof CARD_SIZES[CardSizeKey],
  chairAttachMm: number,
  backHeight: number,
  seatDepth: number,
): AssemblyStep[] {
  return [
    {
      step: 1,
      title: "Fold the card base",
      instruction: `Score the ${card.label} card down the centre (${card.halfWidthMm}mm from each edge). Fold in half and crease firmly with a bone folder.`,
      tip: "A bone folder gives a sharper fold than a fingernail.",
    },
    {
      step: 2,
      title: "Cut and score the table strip",
      instruction: `Cut a ${p.tableWidthMm}×${p.tableDepthMm * 2}mm strip from cardstock. Score a valley fold across the centre at ${p.tableDepthMm}mm from each long edge.`,
      mechanism: "box-fold",
    },
    {
      step: 3,
      title: "Glue the table to the card",
      instruction: `Open the card flat. Centre the table strip across the spine. Glue the top ${4}mm strip to the left card half and the bottom ${4}mm strip to the right card half. Let dry completely.`,
      mechanism: "box-fold",
      tip: "Close the card slowly to check the table pops up straight. Adjust while the glue is still wet.",
    },
    {
      step: 4,
      title: "Cut the two chair pieces",
      instruction: `Cut two ${p.chairWidthMm}×${backHeight + seatDepth}mm pieces. Score a valley fold on each at ${backHeight}mm from the top — this is where the seat meets the back.`,
      mechanism: "v-fold",
    },
    {
      step: 5,
      title: "Glue the chairs",
      instruction: `Glue the bottom ${4}mm of each chair to the card, ${chairAttachMm}mm from the spine — one on each side of the table, angled at 45° to the spine so they stand upright when the card is open.`,
      mechanism: "v-fold",
      tip: "Open the card to 90° to check both chairs stand vertically before the glue sets.",
    },
    {
      step: 6,
      title: "Add the photos",
      instruction: `Print each person's photo at the size shown. Trim and glue one photo to the upper section (chair back) of each chair.`,
      tip: "Use photo paper and centre the face in the frame.",
    },
  ];
}

function validate(params: BirthdayTableParams): SceneValidation {
  const card = CARD_SIZES[params.cardSize];
  const { backHeight } = chairDims(params.chairWidthMm);
  const chairAttachMm = params.tableDepthMm + 15;
  const footprint = chairAttachMm + backHeight;
  const warnings: string[] = [];

  if (footprint > card.halfWidthMm - 8) {
    warnings.push(
      `Chair footprint (${footprint}mm) exceeds the card limit of ${card.halfWidthMm - 8}mm. ` +
      `Reduce chair width or table depth.`
    );
  }
  if (params.tableWidthMm > card.halfWidthMm * 1.9) {
    warnings.push(
      `Table width (${params.tableWidthMm}mm) is wider than the card (max ${Math.round(card.halfWidthMm * 1.9)}mm).`
    );
  }

  return { ok: warnings.length === 0, warnings };
}

function generate(params: BirthdayTableParams): CardDesign {
  const card = CARD_SIZES[params.cardSize];
  const { tableWidthMm, tableDepthMm, chairWidthMm } = params;
  const { backHeight, seatDepth } = chairDims(chairWidthMm);
  const chairAttachMm = tableDepthMm + 15;
  const photoW = chairWidthMm - 8;
  const photoH = backHeight - 13;

  const materials: Material[] = [
    {
      piece: "Card base",
      width_mm:  card.halfWidthMm * 2,
      height_mm: card.heightMm,
      weight_lb: 80,
      color: "Any",
      quantity: 1,
      notes: `Score and fold at centre (${card.halfWidthMm}mm)`,
    },
    {
      piece: "Table strip",
      width_mm:  tableWidthMm,
      height_mm: tableDepthMm * 2,
      weight_lb: 65,
      color: "Any",
      quantity: 1,
      notes: `Valley fold at centre (${tableDepthMm}mm from each edge)`,
    },
    {
      piece: "Chair piece",
      width_mm:  chairWidthMm,
      height_mm: backHeight + seatDepth,
      weight_lb: 65,
      color: "Any",
      quantity: 2,
      notes: `Valley fold at ${backHeight}mm from top`,
    },
  ];

  return {
    title: "Birthday Table",
    concept: "A table pops up from the card spine with two chairs, one on each side. Photos of two people are glued to the chair backs.",
    technique_summary: "Box fold table + two V-fold chairs",
    difficulty: "beginner",
    mechanisms_used: ["box-fold", "v-fold"],
    card_size: {
      flat_width_mm:   card.halfWidthMm * 2,
      flat_height_mm:  card.heightMm,
      folded_width_mm: card.halfWidthMm,
      folded_height_mm: card.heightMm,
    },
    materials,
    steps: makeSteps(params, card, chairAttachMm, backHeight, seatDepth),
    design_notes:
      `Chair attachment: ${chairAttachMm}mm from spine. ` +
      `Photo zone per chair: ${photoW}×${photoH}mm.`,
    template_pieces: [
      makeTable(tableWidthMm, tableDepthMm),
      makeChair("chair-left",  "Left Chair (cut 1) — V-fold",  chairWidthMm, backHeight, seatDepth),
      makeChair("chair-right", "Right Chair (cut 1) — V-fold", chairWidthMm, backHeight, seatDepth),
    ],
    photo_placements: [
      {
        piece_id: "chair-left",
        piece_label: "Left Chair",
        print_width_mm:  photoW,
        print_height_mm: photoH,
        position_on_piece: "Upper section (chair back)",
        attach_at_step: 6,
        notes: "Centre the face in the photo",
      },
      {
        piece_id: "chair-right",
        piece_label: "Right Chair",
        print_width_mm:  photoW,
        print_height_mm: photoH,
        position_on_piece: "Upper section (chair back)",
        attach_at_step: 6,
        notes: "Centre the face in the photo",
      },
    ],
  };
}

export const birthdayTableScene: Scene<BirthdayTableParams> = {
  id: "birthday-table",
  name: "Birthday Table",
  description: "Table pops up with two chairs — place a photo of each person on their chair.",
  emoji: "🎂",
  defaultParams: {
    cardSize:      "a5",
    tableWidthMm:  100,
    tableDepthMm:  30,
    chairWidthMm:  50,
  },
  paramSchema: [
    {
      key: "cardSize",
      label: "Card size",
      type: "select",
      options: [
        { value: "a5", label: "A5 — folded A4 (148×210mm)" },
        { value: "a6", label: "A6 — folded A5 (105×148mm)" },
      ],
    },
    { key: "tableWidthMm",  label: "Table width",         type: "range", min: 60,  max: 130, step: 5,  unit: "mm" },
    { key: "tableDepthMm",  label: "Table depth (height)", type: "range", min: 20,  max: 40,  step: 5,  unit: "mm" },
    { key: "chairWidthMm",  label: "Chair width",          type: "range", min: 35,  max: 65,  step: 5,  unit: "mm" },
  ],
  photoSlots: [
    { id: "chair-left",  label: "Person on left chair",  hint: "Portrait — face and shoulders work best" },
    { id: "chair-right", label: "Person on right chair", hint: "Portrait — face and shoulders work best" },
  ],
  validate,
  generate,
};
