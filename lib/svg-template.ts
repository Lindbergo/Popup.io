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
  sheet: "#ffffff",
};

const SCALE = 2.83; // 1mm = 2.83 SVG units (approx 72dpi)
const MARGIN = 20;
const PIECE_GAP = 15;

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

function renderPiece(piece: TemplatePiece, ox: number, oy: number): string {
  const px = mm(ox);
  const py = mm(oy);
  const pw = mm(piece.width);
  const ph = mm(piece.height);

  let svg = "";

  // Glue zones
  for (const g of piece.glueZones ?? []) {
    svg += `<rect x="${px + mm(g.x)}" y="${py + mm(g.y)}" width="${mm(g.width)}" height="${mm(g.height)}" fill="${COLORS.glueFill}" stroke="${COLORS.glue}" stroke-width="1" stroke-dasharray="3,3"/>`;
  }

  // Piece outline
  svg += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="none" stroke="${COLORS.border}" stroke-width="1.5"/>`;

  // Cut lines
  for (const c of piece.cutLines ?? []) {
    svg += `<line x1="${px + mm(c.x1)}" y1="${py + mm(c.y1)}" x2="${px + mm(c.x2)}" y2="${py + mm(c.y2)}" stroke="${COLORS.cut}" stroke-width="2"/>`;
  }

  // Fold lines
  for (const f of piece.foldLines ?? []) {
    svg += `<line x1="${px + mm(f.x1)}" y1="${py + mm(f.y1)}" x2="${px + mm(f.x2)}" y2="${py + mm(f.y2)}" stroke="${foldLineColor(f.type)}" stroke-width="1.5" stroke-dasharray="${foldLineDash(f.type)}"/>`;
  }

  // Label
  svg += `<text x="${px + pw / 2}" y="${py - 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="${COLORS.label}" font-weight="bold">${piece.label}</text>`;

  // Dimension labels
  svg += `<text x="${px + pw / 2}" y="${py + ph + 12}" text-anchor="middle" font-family="Arial, sans-serif" font-size="7.5" fill="#718096">${piece.width}×${piece.height}mm</text>`;

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

  // Lay out pieces in a grid
  const colWidth = Math.max(...pieces.map((p) => p.width), 100) + PIECE_GAP + 30;
  const colCount = Math.min(3, pieces.length);

  const positions: { x: number; y: number }[] = [];
  let rowY = MARGIN + 30;
  let rowMaxH = 0;

  pieces.forEach((piece, i) => {
    const col = i % colCount;
    const x = MARGIN + col * (colWidth + PIECE_GAP);
    if (col === 0 && i > 0) {
      rowY += rowMaxH + PIECE_GAP + 30;
      rowMaxH = 0;
    }
    positions.push({ x, y: rowY });
    rowMaxH = Math.max(rowMaxH, piece.height);
  });

  const legendY = rowY + rowMaxH + PIECE_GAP + 40;
  const svgWidth = Math.max(
    MARGIN * 2 + colCount * (colWidth + PIECE_GAP),
    400
  );
  const svgHeight = legendY + 120;

  let content = "";

  // Title
  content += `<text x="${svgWidth / 2}" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="${COLORS.label}">${design.title} — Print Template</text>`;
  content += `<text x="${svgWidth / 2}" y="36" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="#718096">Print at 100% scale. 1mm = 1mm. Do not scale to fit.</text>`;

  // Pieces
  pieces.forEach((piece, i) => {
    const pos = positions[i];
    content += renderPiece(piece, pos.x / SCALE, pos.y / SCALE);
  });

  // Legend
  content += renderLegend(MARGIN, legendY);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
  <rect width="${svgWidth}" height="${svgHeight}" fill="${COLORS.background}"/>
  ${content}
</svg>`;
}
