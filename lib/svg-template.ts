import type { CardDesign, TemplatePiece, FoldLine } from "@/types/card";

const COLORS = {
  cut: "#e53e3e",
  valley: "#3182ce",
  mountain: "#38a169",
  score: "#a0aec0",
  glue: "#f6e05e",
  glueFill: "#fefcbf",
  border: "#2d3748",
  label: "#1a202c",
  background: "#f7fafc",
};

const SCALE = 2.83; // 1mm = 2.83 SVG px (72 dpi)

// All layout constants in SVG pixels
const MARGIN = 20;
const PIECE_GAP = 15;
const LABEL_ABOVE = 18; // px reserved above each piece for the piece name label
const LABEL_BELOW = 16; // px reserved below each piece for the dimension label

function mm(v: number) {
  return v * SCALE;
}

function foldLineDash(type: FoldLine["type"]): string {
  if (type === "valley") return "6,4";
  if (type === "mountain") return "6,3,2,3";
  return "2,2";
}

function foldLineColor(type: FoldLine["type"]): string {
  if (type === "valley") return COLORS.valley;
  if (type === "mountain") return COLORS.mountain;
  return COLORS.score;
}

// ox, oy are in SVG pixels
function renderPiece(piece: TemplatePiece, ox: number, oy: number): string {
  const pw = mm(piece.width);
  const ph = mm(piece.height);

  let svg = "";

  // Glue zones — piece-local coords are in mm, convert to px relative to ox/oy
  for (const g of piece.glueZones ?? []) {
    svg += `<rect x="${ox + mm(g.x)}" y="${oy + mm(g.y)}" width="${mm(g.width)}" height="${mm(g.height)}" fill="${COLORS.glueFill}" stroke="${COLORS.glue}" stroke-width="1" stroke-dasharray="3,3"/>`;
  }

  // Piece outline
  svg += `<rect x="${ox}" y="${oy}" width="${pw}" height="${ph}" fill="none" stroke="${COLORS.border}" stroke-width="1.5"/>`;

  // Cut lines
  for (const c of piece.cutLines ?? []) {
    svg += `<line x1="${ox + mm(c.x1)}" y1="${oy + mm(c.y1)}" x2="${ox + mm(c.x2)}" y2="${oy + mm(c.y2)}" stroke="${COLORS.cut}" stroke-width="2"/>`;
  }

  // Fold lines
  for (const f of piece.foldLines ?? []) {
    svg += `<line x1="${ox + mm(f.x1)}" y1="${oy + mm(f.y1)}" x2="${ox + mm(f.x2)}" y2="${oy + mm(f.y2)}" stroke="${foldLineColor(f.type)}" stroke-width="1.5" stroke-dasharray="${foldLineDash(f.type)}"/>`;
  }

  // Labels in px space — no conversion needed
  svg += `<text x="${ox + pw / 2}" y="${oy - 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="${COLORS.label}" font-weight="bold">${piece.label}</text>`;
  svg += `<text x="${ox + pw / 2}" y="${oy + ph + 12}" text-anchor="middle" font-family="Arial, sans-serif" font-size="7.5" fill="#718096">${piece.width}×${piece.height}mm</text>`;

  return svg;
}

function renderLegend(x: number, y: number): string {
  const items = [
    { color: COLORS.cut, dash: "none", label: "Cut line" },
    { color: COLORS.valley, dash: "6,4", label: "Valley fold (fold toward you)" },
    { color: COLORS.mountain, dash: "6,3,2,3", label: "Mountain fold (fold away)" },
    { color: COLORS.score, dash: "2,2", label: "Score line (press, don't cut)" },
    { color: COLORS.glue, dash: "3,3", label: "Glue zone" },
  ];

  let svg = `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="${COLORS.label}">Legend</text>`;

  items.forEach((item, i) => {
    const iy = y + 16 + i * 16;
    if (item.label === "Glue zone") {
      svg += `<rect x="${x}" y="${iy - 7}" width="24" height="10" fill="${COLORS.glueFill}" stroke="${item.color}" stroke-width="1" stroke-dasharray="${item.dash}"/>`;
    } else {
      svg += `<line x1="${x}" y1="${iy - 2}" x2="${x + 24}" y2="${iy - 2}" stroke="${item.color}" stroke-width="${item.label === "Cut line" ? 2 : 1.5}" stroke-dasharray="${item.dash}"/>`;
    }
    svg += `<text x="${x + 30}" y="${iy}" font-family="Arial, sans-serif" font-size="9" fill="${COLORS.label}">${item.label}</text>`;
  });

  return svg;
}

export function generateSVG(design: CardDesign): string {
  const pieces = design.template_pieces ?? [];
  const colCount = Math.max(1, Math.min(3, pieces.length));

  // Convert piece widths to SVG pixels for layout, then find the widest column
  const maxPiecePx = pieces.length > 0
    ? Math.max(...pieces.map((p) => mm(p.width)))
    : mm(100);
  const colWidth = maxPiecePx + PIECE_GAP; // all SVG pixels

  // Build positions — everything in SVG pixels
  const positions: { x: number; y: number }[] = [];
  let rowY = MARGIN + 30 + LABEL_ABOVE; // 30px title area + label space
  let rowMaxH = 0; // SVG pixels

  pieces.forEach((piece, i) => {
    const col = i % colCount;
    if (col === 0 && i > 0) {
      rowY += rowMaxH + PIECE_GAP + LABEL_ABOVE + LABEL_BELOW;
      rowMaxH = 0;
    }
    const x = MARGIN + col * (colWidth + PIECE_GAP);
    positions.push({ x, y: rowY });
    rowMaxH = Math.max(rowMaxH, mm(piece.height));
  });

  const legendY = rowY + rowMaxH + LABEL_BELOW + PIECE_GAP + 40;
  const svgWidth = Math.max(MARGIN * 2 + colCount * (colWidth + PIECE_GAP), 400);
  const svgHeight = legendY + 120;

  let content = "";

  content += `<text x="${svgWidth / 2}" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="${COLORS.label}">${design.title ?? "Card"} — Print Template</text>`;
  content += `<text x="${svgWidth / 2}" y="36" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="#718096">Print at 100% scale. 1mm = 1mm. Do not scale to fit.</text>`;

  pieces.forEach((piece, i) => {
    const pos = positions[i];
    // pos.x / pos.y are already SVG pixels — pass directly
    content += renderPiece(piece, pos.x, pos.y);
  });

  content += renderLegend(MARGIN, legendY);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
  <rect width="${svgWidth}" height="${svgHeight}" fill="${COLORS.background}"/>
  ${content}
</svg>`;
}
