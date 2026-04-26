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
const MARGIN = 20;
const PIECE_GAP = 20;
const LABEL_ABOVE = 22;
const LABEL_BELOW = 18;
const MIN_DIM_MM = 8; // clamp AI-generated dimensions so no piece is invisible

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

function renderPiece(
  piece: TemplatePiece,
  ox: number,
  oy: number,
  photos?: Map<string, string>,
): { content: string; defs: string } {
  const pw = Math.max(mm(piece.width),  mm(MIN_DIM_MM));
  const ph = Math.max(mm(piece.height), mm(MIN_DIM_MM));
  let svg = "";
  let defs = "";

  for (const g of piece.glueZones ?? []) {
    svg += `<rect x="${ox + mm(g.x)}" y="${oy + mm(g.y)}" width="${mm(g.width)}" height="${mm(g.height)}" fill="${COLORS.glueFill}" stroke="${COLORS.glue}" stroke-width="1" stroke-dasharray="3,3"/>`;
  }

  svg += `<rect x="${ox}" y="${oy}" width="${pw}" height="${ph}" fill="none" stroke="${COLORS.border}" stroke-width="1.5"/>`;

  for (const c of piece.cutLines ?? []) {
    svg += `<line x1="${ox + mm(c.x1)}" y1="${oy + mm(c.y1)}" x2="${ox + mm(c.x2)}" y2="${oy + mm(c.y2)}" stroke="${COLORS.cut}" stroke-width="2"/>`;
  }

  for (const f of piece.foldLines ?? []) {
    svg += `<line x1="${ox + mm(f.x1)}" y1="${oy + mm(f.y1)}" x2="${ox + mm(f.x2)}" y2="${oy + mm(f.y2)}" stroke="${foldLineColor(f.type)}" stroke-width="1.5" stroke-dasharray="${foldLineDash(f.type)}"/>`;
  }

  // Photo zone — rendered behind the fold/cut lines so lines stay visible
  const pz = piece.photo_zone;
  const photoDataUrl = photos?.get(piece.id);
  if (pz && photoDataUrl) {
    const clipId = `photo-clip-${piece.id}`;
    defs += `<clipPath id="${clipId}"><rect x="${ox + mm(pz.x)}" y="${oy + mm(pz.y)}" width="${mm(pz.width)}" height="${mm(pz.height)}"/></clipPath>`;
    svg += `<image href="${photoDataUrl}" x="${ox + mm(pz.x)}" y="${oy + mm(pz.y)}" width="${mm(pz.width)}" height="${mm(pz.height)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})"/>`;
  } else if (pz) {
    // Placeholder when no photo uploaded yet
    svg += `<rect x="${ox + mm(pz.x)}" y="${oy + mm(pz.y)}" width="${mm(pz.width)}" height="${mm(pz.height)}" fill="#f0f4ff" stroke="#93c5fd" stroke-width="1" stroke-dasharray="4,3"/>`;
    svg += `<text x="${ox + mm(pz.x + pz.width / 2)}" y="${oy + mm(pz.y + pz.height / 2)}" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="8" fill="#93c5fd">photo</text>`;
  }

  // Label above piece — white pill background so it reads against the page
  const labelX = ox + pw / 2;
  const labelY = oy - 8;
  const labelText = piece.label;
  const approxLabelW = labelText.length * 7 + 12;
  svg += `<rect x="${labelX - approxLabelW / 2}" y="${labelY - 13}" width="${approxLabelW}" height="16" rx="3" fill="white" fill-opacity="0.85"/>`;
  svg += `<text x="${labelX}" y="${labelY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="${COLORS.label}">${labelText}</text>`;

  // Dimension below piece
  svg += `<text x="${ox + pw / 2}" y="${oy + ph + 14}" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" fill="#718096">${piece.width}×${piece.height}mm</text>`;

  return { content: svg, defs };
}

function renderLegend(x: number, y: number): string {
  const items = [
    { color: COLORS.cut, dash: "none", label: "Cut line" },
    { color: COLORS.valley, dash: "6,4", label: "Valley fold (fold toward you)" },
    { color: COLORS.mountain, dash: "6,3,2,3", label: "Mountain fold (fold away)" },
    { color: COLORS.score, dash: "2,2", label: "Score line (press, don't cut)" },
    { color: COLORS.glue, dash: "3,3", label: "Glue zone" },
  ];

  let svg = `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="${COLORS.label}">Legend</text>`;

  items.forEach((item, i) => {
    const iy = y + 18 + i * 18;
    if (item.label === "Glue zone") {
      svg += `<rect x="${x}" y="${iy - 7}" width="24" height="10" fill="${COLORS.glueFill}" stroke="${item.color}" stroke-width="1" stroke-dasharray="${item.dash}"/>`;
    } else {
      svg += `<line x1="${x}" y1="${iy - 2}" x2="${x + 24}" y2="${iy - 2}" stroke="${item.color}" stroke-width="${item.label === "Cut line" ? 2 : 1.5}" stroke-dasharray="${item.dash}"/>`;
    }
    svg += `<text x="${x + 30}" y="${iy}" font-family="Arial, sans-serif" font-size="10" fill="${COLORS.label}">${item.label}</text>`;
  });

  return svg;
}

function renderVerificationSquare(x: number, y: number): string {
  const side = mm(50);
  const mid = side / 2;
  const tickLen = mm(3);

  let svg = "";

  svg += `<rect x="${x}" y="${y}" width="${side}" height="${side}" fill="white" stroke="${COLORS.border}" stroke-width="1.5"/>`;

  svg += `<line x1="${x + mid}" y1="${y}" x2="${x + mid}" y2="${y + side}" stroke="${COLORS.border}" stroke-width="0.75" stroke-dasharray="4,3"/>`;
  svg += `<line x1="${x}" y1="${y + mid}" x2="${x + side}" y2="${y + mid}" stroke="${COLORS.border}" stroke-width="0.75" stroke-dasharray="4,3"/>`;

  const corners = [
    { cx: x, cy: y, dx: 1, dy: 1 },
    { cx: x + side, cy: y, dx: -1, dy: 1 },
    { cx: x, cy: y + side, dx: 1, dy: -1 },
    { cx: x + side, cy: y + side, dx: -1, dy: -1 },
  ];
  for (const c of corners) {
    svg += `<line x1="${c.cx}" y1="${c.cy}" x2="${c.cx + c.dx * tickLen}" y2="${c.cy}" stroke="${COLORS.border}" stroke-width="2"/>`;
    svg += `<line x1="${c.cx}" y1="${c.cy}" x2="${c.cx}" y2="${c.cy + c.dy * tickLen}" stroke="${COLORS.border}" stroke-width="2"/>`;
  }

  svg += `<text x="${x + mid}" y="${y - 4}" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" fill="${COLORS.label}">50mm</text>`;
  svg += `<text x="${x - 4}" y="${y + mid + 3}" text-anchor="end" font-family="Arial, sans-serif" font-size="8" fill="${COLORS.label}">50mm</text>`;
  svg += `<text x="${x + mid}" y="${y + mid - 8}" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="${COLORS.label}">PRINT CHECK</text>`;
  svg += `<text x="${x + mid}" y="${y + mid + 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="7" fill="#4a5568">Measure this square.</text>`;
  svg += `<text x="${x + mid}" y="${y + mid + 15}" text-anchor="middle" font-family="Arial, sans-serif" font-size="7" fill="#4a5568">Must be exactly 50×50mm.</text>`;
  svg += `<text x="${x + mid}" y="${y + mid + 25}" text-anchor="middle" font-family="Arial, sans-serif" font-size="6.5" fill="#e53e3e">If not: reprint at 100%.</text>`;

  return svg;
}

interface SVGResult {
  svg: string;
  widthMm: number;
  heightMm: number;
}

function buildSVG(design: CardDesign, photos?: Map<string, string>): SVGResult {
  const pieces = design.template_pieces ?? [];

  // Use 2 columns only when two max-width pieces fit side-by-side within A4 portrait
  // (190mm content width). Wide pieces like a card back force everything into 1 column
  // so the template stays portrait-oriented and prints on a single sheet.
  const TARGET_CONTENT_MM = 190;
  const maxPieceWmm = pieces.length > 0
    ? Math.max(...pieces.map((p) => Math.max(p.width, MIN_DIM_MM)))
    : 100;
  const colCount = pieces.length >= 2 && maxPieceWmm * 2 + PIECE_GAP / SCALE <= TARGET_CONTENT_MM
    ? 2
    : 1;

  // Per-column max width — each column is only as wide as its widest piece
  const colMaxW: number[] = new Array(colCount).fill(0);
  pieces.forEach((piece, i) => {
    const col = i % colCount;
    colMaxW[col] = Math.max(colMaxW[col], mm(Math.max(piece.width, MIN_DIM_MM)));
  });

  // Cumulative x offsets for each column
  const colX: number[] = [MARGIN];
  for (let c = 1; c < colCount; c++) {
    colX[c] = colX[c - 1] + colMaxW[c - 1] + PIECE_GAP;
  }

  const positions: { x: number; y: number }[] = [];
  let rowY = MARGIN + 30 + LABEL_ABOVE;
  let rowMaxH = 0;

  pieces.forEach((piece, i) => {
    const col = i % colCount;
    if (col === 0 && i > 0) {
      rowY += rowMaxH + PIECE_GAP + LABEL_ABOVE + LABEL_BELOW;
      rowMaxH = 0;
    }
    positions.push({ x: colX[col], y: rowY });
    rowMaxH = Math.max(rowMaxH, mm(Math.max(piece.height, MIN_DIM_MM)));
  });

  const legendY = rowY + rowMaxH + LABEL_BELOW + PIECE_GAP + 40;

  const verifySquareSide = mm(50);
  const legendWidth = 260;
  const verifyX = MARGIN + legendWidth + 30;
  const verifyY = legendY;

  const totalColW = colX[colCount - 1] + colMaxW[colCount - 1];
  const minWidth = verifyX + verifySquareSide + MARGIN;
  const svgWidth = Math.max(totalColW + MARGIN, minWidth, 400);
  const svgHeight = legendY + Math.max(100, verifySquareSide + 30);

  let content = "";
  let defs = "";

  content += `<text x="${svgWidth / 2}" y="22" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="${COLORS.label}">${design.title ?? "Card"} — Print Template</text>`;
  content += `<text x="${svgWidth / 2}" y="38" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#718096">Step 1: check PRINT CHECK square. Step 2: cut red lines. Step 3: fold on dashed lines.</text>`;

  pieces.forEach((piece, i) => {
    const { content: pc, defs: pd } = renderPiece(piece, positions[i].x, positions[i].y, photos);
    content += pc;
    defs += pd;
  });

  content += renderLegend(MARGIN, legendY);
  content += renderVerificationSquare(verifyX, verifyY);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
  ${defs ? `<defs>${defs}</defs>` : ""}
  <rect width="${svgWidth}" height="${svgHeight}" fill="${COLORS.background}"/>
  ${content}
</svg>`;

  return {
    svg,
    widthMm: Math.round(svgWidth / SCALE),
    heightMm: Math.round(svgHeight / SCALE),
  };
}

export function generateSVG(design: CardDesign, photos?: Map<string, string>): string {
  return buildSVG(design, photos).svg;
}

export function generatePrintHTML(design: CardDesign, photos?: Map<string, string>): string {
  const { svg, widthMm, heightMm } = buildSVG(design, photos);
  const svgBase64 = btoa(unescape(encodeURIComponent(svg)));

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${design.title ?? "Card"} — Print Template</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page {
    size: ${widthMm}mm ${heightMm}mm;
    margin: 0;
  }
  body {
    width: ${widthMm}mm;
    height: ${heightMm}mm;
    overflow: hidden;
  }
  img {
    display: block;
    width: ${widthMm}mm;
    height: ${heightMm}mm;
  }
  .no-print {
    display: block;
    position: fixed;
    top: 0; left: 0; right: 0;
    background: #1a202c;
    color: white;
    text-align: center;
    padding: 12px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    z-index: 9999;
  }
  @media print {
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="no-print">
  In the print dialog: set Scale to <strong>100%</strong> (or "Actual Size") and margins to <strong>None</strong>. Then click Print.
</div>
<img src="data:image/svg+xml;base64,${svgBase64}" alt="Print template" />
</body>
</html>`;
}
