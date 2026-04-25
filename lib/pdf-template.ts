import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";
import type { CardDesign, TemplatePiece, FoldLine } from "@/types/card";

// PDF uses points: 1mm = 2.835pt
const PT = 2.835;

// Layout constants — same proportions as svg-template.ts
const MARGIN = 20 * PT;
const PIECE_GAP = 15 * PT;
const LABEL_ABOVE = 18 * PT;
const LABEL_BELOW = 16 * PT;

function mm(v: number) {
  return v * PT;
}

// PDF origin is bottom-left; SVG is top-left. This flips y for a given page height.
function fy(pageHeight: number, y: number) {
  return pageHeight - y;
}

// --- Colors ---
const C = {
  cut:        rgb(0.898, 0.243, 0.243),
  valley:     rgb(0.196, 0.510, 0.808),
  mountain:   rgb(0.220, 0.635, 0.412),
  score:      rgb(0.627, 0.675, 0.706),
  glue:       rgb(0.965, 0.878, 0.322),
  glueFill:   rgb(0.996, 0.988, 0.745),
  border:     rgb(0.176, 0.216, 0.282),
  label:      rgb(0.102, 0.125, 0.161),
  dim:        rgb(0.471, 0.533, 0.600),
  background: rgb(0.969, 0.980, 0.988),
  white:      rgb(1, 1, 1),
  danger:     rgb(0.898, 0.243, 0.243),
};

function foldDash(type: FoldLine["type"]): number[] {
  if (type === "valley")   return [6, 4];
  if (type === "mountain") return [6, 3, 2, 3];
  return [2, 2];
}

function foldColor(type: FoldLine["type"]) {
  if (type === "valley")   return C.valley;
  if (type === "mountain") return C.mountain;
  return C.score;
}

// Text width approximation for Helvetica (avg 0.52× font size per char)
function textWidth(text: string, size: number) {
  return text.length * size * 0.52;
}

function drawCenteredText(
  page: PDFPage,
  pageH: number,
  text: string,
  cx: number,
  y: number,
  size: number,
  font: PDFFont,
  color = C.label,
) {
  const w = textWidth(text, size);
  page.drawText(text, { x: cx - w / 2, y: fy(pageH, y + size), size, font, color });
}

function drawPiece(
  page: PDFPage,
  pageH: number,
  piece: TemplatePiece,
  ox: number,
  oy: number,
  font: PDFFont,
) {
  const pw = mm(piece.width);
  const ph = mm(piece.height);

  // Glue zones
  for (const g of piece.glueZones ?? []) {
    page.drawRectangle({
      x: ox + mm(g.x),
      y: fy(pageH, oy + mm(g.y) + mm(g.height)),
      width: mm(g.width),
      height: mm(g.height),
      color: C.glueFill,
      borderColor: C.glue,
      borderWidth: 0.75,
    });
  }

  // Piece outline
  page.drawRectangle({
    x: ox,
    y: fy(pageH, oy + ph),
    width: pw,
    height: ph,
    borderColor: C.border,
    borderWidth: 1.5,
  });

  // Cut lines
  for (const c of piece.cutLines ?? []) {
    page.drawLine({
      start: { x: ox + mm(c.x1), y: fy(pageH, oy + mm(c.y1)) },
      end:   { x: ox + mm(c.x2), y: fy(pageH, oy + mm(c.y2)) },
      color: C.cut,
      thickness: 2,
    });
  }

  // Fold lines
  for (const f of piece.foldLines ?? []) {
    page.drawLine({
      start: { x: ox + mm(f.x1), y: fy(pageH, oy + mm(f.y1)) },
      end:   { x: ox + mm(f.x2), y: fy(pageH, oy + mm(f.y2)) },
      color: foldColor(f.type),
      thickness: 1.5,
      dashArray: foldDash(f.type),
      dashPhase: 0,
    });
  }

  // Piece name — above the piece
  drawCenteredText(page, pageH, piece.label, ox + pw / 2, oy - LABEL_ABOVE + 5, 8, font);

  // Dimension label — below the piece
  drawCenteredText(
    page, pageH,
    `${piece.width}×${piece.height}mm`,
    ox + pw / 2,
    oy + ph + 4,
    7, font, C.dim,
  );
}

function drawLegend(page: PDFPage, pageH: number, x: number, y: number, font: PDFFont) {
  page.drawText("Legend", { x, y: fy(pageH, y + 10), size: 10, font, color: C.label });

  const items = [
    { color: C.cut,      dash: [] as number[],  label: "Cut line",                      swatch: "line" as const },
    { color: C.valley,   dash: [6, 4],           label: "Valley fold (fold toward you)", swatch: "line" as const },
    { color: C.mountain, dash: [6, 3, 2, 3],     label: "Mountain fold (fold away)",     swatch: "line" as const },
    { color: C.score,    dash: [2, 2],            label: "Score line (press, don't cut)", swatch: "line" as const },
    { color: C.glue,     dash: [] as number[],   label: "Glue zone",                     swatch: "rect" as const },
  ];

  items.forEach((item, i) => {
    const iy = y + 16 + i * 16;
    if (item.swatch === "rect") {
      page.drawRectangle({
        x, y: fy(pageH, iy + 4),
        width: 24, height: 10,
        color: C.glueFill,
        borderColor: item.color,
        borderWidth: 1,
      });
    } else {
      page.drawLine({
        start: { x, y: fy(pageH, iy) },
        end:   { x: x + 24, y: fy(pageH, iy) },
        color: item.color,
        thickness: item.label === "Cut line" ? 2 : 1.5,
        dashArray: item.dash,
        dashPhase: 0,
      });
    }
    page.drawText(item.label, { x: x + 30, y: fy(pageH, iy + 3), size: 8.5, font, color: C.label });
  });
}

function drawVerificationSquare(page: PDFPage, pageH: number, x: number, y: number, font: PDFFont) {
  const side = mm(50);
  const mid  = side / 2;
  const tick = mm(3);

  // Background
  page.drawRectangle({
    x, y: fy(pageH, y + side),
    width: side, height: side,
    color: C.white,
    borderColor: C.border,
    borderWidth: 1.5,
  });

  // Crosshairs
  page.drawLine({
    start: { x: x + mid, y: fy(pageH, y) },
    end:   { x: x + mid, y: fy(pageH, y + side) },
    color: C.border, thickness: 0.75, dashArray: [4, 3], dashPhase: 0,
  });
  page.drawLine({
    start: { x, y: fy(pageH, y + mid) },
    end:   { x: x + side, y: fy(pageH, y + mid) },
    color: C.border, thickness: 0.75, dashArray: [4, 3], dashPhase: 0,
  });

  // Corner ticks
  const corners = [
    { cx: x,        cy: y,        dx:  1, dy:  1 },
    { cx: x + side, cy: y,        dx: -1, dy:  1 },
    { cx: x,        cy: y + side, dx:  1, dy: -1 },
    { cx: x + side, cy: y + side, dx: -1, dy: -1 },
  ];
  for (const c of corners) {
    page.drawLine({ start: { x: c.cx, y: fy(pageH, c.cy) }, end: { x: c.cx + c.dx * tick, y: fy(pageH, c.cy) }, color: C.border, thickness: 2 });
    page.drawLine({ start: { x: c.cx, y: fy(pageH, c.cy) }, end: { x: c.cx, y: fy(pageH, c.cy + c.dy * tick) }, color: C.border, thickness: 2 });
  }

  // Labels
  drawCenteredText(page, pageH, "50mm", x + mid, y - 10, 7, font, C.dim);
  drawCenteredText(page, pageH, "PRINT CHECK",         x + mid, y + mid - 12, 7.5, font, C.label);
  drawCenteredText(page, pageH, "Measure this square.", x + mid, y + mid + 2,  6.5, font, C.dim);
  drawCenteredText(page, pageH, "Must be 50×50mm.",     x + mid, y + mid + 12, 6.5, font, C.dim);
  drawCenteredText(page, pageH, "If not → reprint at 100%.", x + mid, y + mid + 22, 6, font, C.danger);
}

export async function generatePDF(design: CardDesign): Promise<Uint8Array> {
  const pieces = design.template_pieces ?? [];
  const colCount = Math.max(1, Math.min(3, pieces.length));

  const maxPiecePt = pieces.length > 0
    ? Math.max(...pieces.map((p) => mm(p.width)))
    : mm(100);
  const colWidth = maxPiecePt + PIECE_GAP;

  // Build positions (all in points, top-left origin — we flip when drawing)
  const positions: { x: number; y: number }[] = [];
  let rowY = MARGIN + 30 + LABEL_ABOVE;
  let rowMaxH = 0;

  pieces.forEach((piece, i) => {
    const col = i % colCount;
    if (col === 0 && i > 0) {
      rowY += rowMaxH + PIECE_GAP + LABEL_ABOVE + LABEL_BELOW;
      rowMaxH = 0;
    }
    positions.push({ x: MARGIN + col * (colWidth + PIECE_GAP), y: rowY });
    rowMaxH = Math.max(rowMaxH, mm(piece.height));
  });

  const legendY      = rowY + rowMaxH + LABEL_BELOW + PIECE_GAP + 40;
  const legendWidth  = 220;
  const verifyX      = MARGIN + legendWidth + 30;
  const verifyY      = legendY;
  const verifyHeight = mm(50) + 30;

  const minWidth  = verifyX + mm(50) + MARGIN;
  const pageWidth = Math.max(MARGIN * 2 + colCount * (colWidth + PIECE_GAP), minWidth, 400);
  const pageHeight = legendY + Math.max(100, verifyHeight);

  // Create document
  const pdfDoc = await PDFDocument.create();
  const page   = pdfDoc.addPage([pageWidth, pageHeight]);
  const font   = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Background
  page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: C.background });

  // Title
  const title = `${design.title ?? "Card"} — Print Template`;
  drawCenteredText(page, pageHeight, title, pageWidth / 2, 8, 13, fontBold);

  const subtitle = "Step 1: check PRINT CHECK square below. Step 2: cut red lines. Step 3: fold on dashed lines.";
  drawCenteredText(page, pageHeight, subtitle, pageWidth / 2, 24, 8, font, C.dim);

  // Pieces
  pieces.forEach((piece, i) => {
    drawPiece(page, pageHeight, piece, positions[i].x, positions[i].y, font);
  });

  // Legend + verification square
  drawLegend(page, pageHeight, MARGIN, legendY, font);
  drawVerificationSquare(page, pageHeight, verifyX, verifyY, font);

  return pdfDoc.save();
}
