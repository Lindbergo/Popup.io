"use client";

import { useState } from "react";
import type { BirthdayTableParams } from "@/lib/scenes/birthday-table";

interface Props {
  params: BirthdayTableParams;
  photos: Map<string, string>;
}

const CARD_SIZES = {
  a5: { hw: 148, h: 210 },
  a6: { hw: 105, h: 148 },
};

const SCALE      = 0.52;
// CSS rotateY angles for the two card halves
const CLOSE_CSS  = 88;   // panels nearly edge-on  → card physically closed
const OPEN_CSS   = 45;   // panels at 45°          → card physically open at 90°

function px(mm: number) { return Math.round(mm * SCALE); }

export default function BirthdayTablePreview({ params, photos }: Props) {
  const [openPct, setOpenPct] = useState(0);

  const card   = CARD_SIZES[params.cardSize];
  const panelW = px(card.hw);
  const panelH = px(card.h);

  // CSS panel angle (rotateY applied to each half)
  const cssAlpha    = CLOSE_CSS - openPct * (CLOSE_CSS - OPEN_CSS);
  const alphaRad    = (cssAlpha * Math.PI) / 180;

  // ── Table (box fold) ────────────────────────────────────────────────────
  // The table strip is glued across the spine. Each glue edge sits on one
  // panel surface at distance d from the spine. As the card opens the fold
  // point rises. In CSS 3D the spine is at x=0; the panel surface faces ±Z.
  //
  // Panel surface Z at distance d along panel = -d * sin(α)  (into the screen)
  // Table fold-line Y relative to attach Y   = -d * sin(α)   (rises upward)
  //
  // We represent the table as two half-strips, one per panel, hinged at the
  // spine (x=0).  Each half-strip is a child of its panel so it inherits the
  // panel rotateY automatically — only the fold-line elevation needs extra work.

  const tableW  = px(params.tableWidthMm);
  const tableD  = px(params.tableDepthMm);   // half-strip length in px
  const chairW  = px(params.chairWidthMm);
  const backH   = px(params.chairWidthMm * 1.3);
  const seatH   = px(params.chairWidthMm * 0.5);

  // Where the glue strip meets the panel (from the fold, in panel-local coords)
  const attachY      = Math.round(panelH * 0.28) + backH + seatH;
  // How far the table fold-line rises above the attach line (in px)
  const riseY        = Math.round(tableD * Math.sin(alphaRad));

  // Chair fold-line: the chair back rotates about its bottom edge
  // Physical card opening angle θ = 180 - 2*cssAlpha
  // chairAngle = clamp(0, θ, 90) → how upright the chair back stands
  const chairAngleDeg = Math.min(90, Math.max(0, 180 - 2 * cssAlpha));

  // Chair attachment distance from spine (in px)
  const attachDistX  = px(params.tableDepthMm + 15);

  const containerW = panelW * 2 + 20;
  const containerH = Math.round(panelH * 0.70);

  return (
    <div>
      {/* 3D stage */}
      <div
        style={{
          width: containerW, height: containerH,
          perspective: "520px", perspectiveOrigin: "50% 16%",
          margin: "0 auto", overflow: "hidden", position: "relative",
        }}
      >
        {/* Spine anchor — children are positioned left/right of x=0 */}
        <div style={{ position: "absolute", left: "50%", top: 0, transformStyle: "preserve-3d" }}>

          {/* ── LEFT PANEL ────────────────────────────────────────────── */}
          <div style={{
            position: "absolute", right: 0, top: 0,
            width: panelW, height: panelH,
            background: "linear-gradient(90deg, #f2e8d9, #fdf8f2)",
            border: "1px solid #d4c5a9",
            transformOrigin: "right center",
            transform: `rotateY(${cssAlpha}deg)`,
            transformStyle: "preserve-3d",
          }}>
            {/* Chair on left panel */}
            <ChairOnPanel
              photo={photos.get("chair-left")}
              chairW={chairW}
              backH={backH}
              seatH={seatH}
              attachTop={attachY - backH - seatH}
              attachRight={attachDistX}
              side="left"
              standAngleDeg={chairAngleDeg}
            />

            {/* Left table half-strip — child of left panel, hinged at right edge (spine) */}
            <div style={{
              position: "absolute",
              right: 0,
              top: attachY - riseY,
              width: tableD,
              height: tableW,
              background: "#c4a065",
              border: "1px solid #9a7a4e",
              borderRadius: 2,
              transformOrigin: "right center",
              // Rotate around the spine edge so the strip lies in the correct plane
              transform: `rotateY(${-cssAlpha}deg) rotateZ(90deg)`,
              transformStyle: "preserve-3d",
              opacity: openPct > 0.05 ? 1 : 0,
              boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
            }} />
          </div>

          {/* ── RIGHT PANEL ───────────────────────────────────────────── */}
          <div style={{
            position: "absolute", left: 0, top: 0,
            width: panelW, height: panelH,
            background: "linear-gradient(270deg, #f2e8d9, #fdf8f2)",
            border: "1px solid #d4c5a9",
            transformOrigin: "left center",
            transform: `rotateY(-${cssAlpha}deg)`,
            transformStyle: "preserve-3d",
          }}>
            {/* Chair on right panel */}
            <ChairOnPanel
              photo={photos.get("chair-right")}
              chairW={chairW}
              backH={backH}
              seatH={seatH}
              attachTop={attachY - backH - seatH}
              attachLeft={attachDistX}
              side="right"
              standAngleDeg={chairAngleDeg}
            />

            {/* Right table half-strip */}
            <div style={{
              position: "absolute",
              left: 0,
              top: attachY - riseY,
              width: tableD,
              height: tableW,
              background: "#c4a065",
              border: "1px solid #9a7a4e",
              borderRadius: 2,
              transformOrigin: "left center",
              transform: `rotateY(${cssAlpha}deg) rotateZ(90deg)`,
              transformStyle: "preserve-3d",
              opacity: openPct > 0.05 ? 1 : 0,
              boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
            }} />
          </div>

        </div>

        {/* Fade-out at bottom */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 48,
          background: "linear-gradient(to bottom, transparent, white)",
          pointerEvents: "none",
        }} />
      </div>

      {/* Slider */}
      <div className="px-6 mt-2">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Closed</span>
          <span>Open</span>
        </div>
        <input
          type="range"
          min={0} max={100}
          value={Math.round(openPct * 100)}
          onChange={(e) => setOpenPct(Number(e.target.value) / 100)}
          className="w-full accent-rose-500 cursor-pointer"
        />
      </div>
    </div>
  );
}

interface ChairProps {
  photo?: string;
  chairW: number;
  backH: number;
  seatH: number;
  attachTop: number;
  attachLeft?: number;
  attachRight?: number;
  side: "left" | "right";
  standAngleDeg: number;
}

// Chair is two pieces:
//   seat  — lies flat on the panel, no extra rotation
//   back  — rotates about its bottom edge (the fold line) by standAngleDeg
function ChairOnPanel({ photo, chairW, backH, seatH, attachTop, attachLeft, attachRight, standAngleDeg }: ChairProps) {
  const posBase: React.CSSProperties = {
    position: "absolute",
    top: attachTop + backH,   // seat top = directly below where back ends
    width: chairW,
    ...(attachLeft  !== undefined ? { left:  attachLeft  } : {}),
    ...(attachRight !== undefined ? { right: attachRight } : {}),
  };

  return (
    <>
      {/* Seat — flat on panel */}
      <div style={{
        ...posBase,
        height: seatH,
        background: "#cec5b8",
        border: "1px solid #b8a98c",
        borderRadius: "0 0 2px 2px",
      }} />

      {/* Chair back — rotates upward from its bottom edge (fold line = seat/back junction) */}
      <div style={{
        position: "absolute",
        top: attachTop,
        width: chairW,
        height: backH,
        transformOrigin: "center bottom",
        // standAngleDeg=0 → flat on panel (rotateX 0); =90 → fully upright (rotateX -90)
        transform: `rotateX(${-standAngleDeg}deg)`,
        transformStyle: "preserve-3d",
        ...(attachLeft  !== undefined ? { left:  attachLeft  } : {}),
        ...(attachRight !== undefined ? { right: attachRight } : {}),
      }}>
        <div style={{
          width: chairW, height: backH,
          background: "#e4dbd0",
          border: "1px solid #b8a98c",
          borderRadius: "2px 2px 0 0",
          overflow: "hidden",
        }}>
          {photo ? (
            <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: Math.max(10, chairW * 0.4), color: "#c4b8a8",
            }}>
              👤
            </div>
          )}
        </div>
      </div>
    </>
  );
}
