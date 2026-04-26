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

const SCALE        = 0.52;
const CLOSED_DEG   = 88;   // rotateY when card is closed — panels nearly edge-on
const OPEN_DEG     = 45;   // rotateY when card is fully open at 90°

function px(mm: number) { return Math.round(mm * SCALE); }

export default function BirthdayTablePreview({ params, photos }: Props) {
  // 0 = fully closed, 1 = fully open
  const [openPct, setOpenPct] = useState(0);

  const panelAngle = CLOSED_DEG - openPct * (CLOSED_DEG - OPEN_DEG);

  // Table fades in once the card is noticeably open
  const tableOpacity = Math.max(0, openPct * 2 - 0.4);

  const card    = CARD_SIZES[params.cardSize];
  const panelW  = px(card.hw);
  const panelH  = px(card.h);
  const tableW  = px(params.tableWidthMm);
  const chairW  = px(params.chairWidthMm);
  const backH   = px(params.chairWidthMm * 1.3);
  const seatH   = px(params.chairWidthMm * 0.5);
  const attach  = px(params.tableDepthMm + 15);

  const chairTop  = Math.round(panelH * 0.28);
  const tableScrY = chairTop + backH + seatH - 10;

  const containerW = panelW * 2 + 20;
  const containerH = Math.round(panelH * 0.72);

  return (
    <div>
      {/* 3D stage */}
      <div
        style={{
          width: containerW, height: containerH,
          perspective: "480px", perspectiveOrigin: "50% 18%",
          margin: "0 auto", overflow: "hidden", position: "relative",
        }}
      >
        <div style={{ position: "absolute", left: "50%", top: 0, transformStyle: "preserve-3d" }}>

          {/* Left panel */}
          <div style={{
            position: "absolute", right: 0, top: 0,
            width: panelW, height: panelH,
            background: "linear-gradient(90deg, #f2e8d9, #fdf8f2)",
            border: "1px solid #d4c5a9",
            transformOrigin: "right center",
            transform: `rotateY(${panelAngle}deg)`,
            transformStyle: "preserve-3d",
          }}>
            <div style={{ position: "absolute", right: attach, top: chairTop, width: chairW, height: backH + seatH }}>
              <ChairShape photo={photos.get("chair-left")} chairW={chairW} backH={backH} seatH={seatH} />
            </div>
          </div>

          {/* Right panel */}
          <div style={{
            position: "absolute", left: 0, top: 0,
            width: panelW, height: panelH,
            background: "linear-gradient(270deg, #f2e8d9, #fdf8f2)",
            border: "1px solid #d4c5a9",
            transformOrigin: "left center",
            transform: `rotateY(-${panelAngle}deg)`,
            transformStyle: "preserve-3d",
          }}>
            <div style={{ position: "absolute", left: attach, top: chairTop, width: chairW, height: backH + seatH }}>
              <ChairShape photo={photos.get("chair-right")} chairW={chairW} backH={backH} seatH={seatH} />
            </div>
          </div>

        </div>

        {/* Table — screen-space overlay at the spine */}
        <div style={{
          position: "absolute", left: "50%", top: tableScrY,
          transform: "translateX(-50%)",
          width: tableW, height: 10,
          background: "#c4a065", border: "1px solid #9a7a4e", borderRadius: 2,
          boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
          opacity: tableOpacity, zIndex: 10,
        }} />

        {/* Fade-out at bottom */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 40,
          background: "linear-gradient(to bottom, transparent, white)",
          pointerEvents: "none",
        }} />
      </div>

      {/* Open/close slider */}
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

function ChairShape({ photo, chairW, backH, seatH }: { photo?: string; chairW: number; backH: number; seatH: number }) {
  return (
    <>
      <div style={{
        width: chairW, height: backH,
        background: "#e4dbd0", border: "1px solid #b8a98c",
        borderRadius: "2px 2px 0 0", overflow: "hidden",
      }}>
        {photo ? (
          <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.max(10, chairW * 0.4), color: "#c4b8a8" }}>
            👤
          </div>
        )}
      </div>
      <div style={{
        width: chairW, height: seatH,
        background: "#cec5b8", border: "1px solid #b8a98c",
        borderTop: "none", borderRadius: "0 0 2px 2px",
      }} />
    </>
  );
}
