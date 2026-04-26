"use client";

import { useEffect, useRef, useState } from "react";
import type { BirthdayTableParams } from "@/lib/scenes/birthday-table";

interface Props {
  params: BirthdayTableParams;
  photos: Map<string, string>;
}

const CARD_SIZES = {
  a5: { hw: 148, h: 210 },
  a6: { hw: 105, h: 148 },
};

const SCALE = 0.52;   // px per mm — keeps preview compact
const ANGLE = 50;     // degrees each panel opens (gives 100° total, looks natural)

function px(mm: number) { return Math.round(mm * SCALE); }

export default function BirthdayTablePreview({ params, photos }: Props) {
  const [openPct, setOpenPct] = useState(0);
  const rafRef = useRef<number>(0);

  // Animate card opening on mount and whenever params change
  useEffect(() => {
    const t0 = performance.now();
    const duration = 1100;
    function tick(now: number) {
      const t = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setOpenPct(eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [params.cardSize, params.chairWidthMm, params.tableDepthMm, params.tableWidthMm]);

  const card     = CARD_SIZES[params.cardSize];
  const panelW   = px(card.hw);
  const panelH   = px(card.h);
  const tableW   = px(params.tableWidthMm);
  const tableH   = 10; // visual thickness of table surface in preview
  const chairW   = px(params.chairWidthMm);
  const backH    = px(params.chairWidthMm * 1.3);
  const seatH    = px(params.chairWidthMm * 0.5);
  const attach   = px(params.tableDepthMm + 15); // chair distance from spine

  const angle = ANGLE * openPct;

  const photoLeft  = photos.get("chair-left");
  const photoRight = photos.get("chair-right");

  // Vertical position of chairs — 30% down from top of panel
  const chairTop = Math.round(panelH * 0.28);

  const containerW = panelW * 2 + 20;
  const containerH = Math.round(panelH * 0.72); // clip bottom — card fades out

  // The table sits at the spine, centred vertically between the chairs
  const tableScrY = chairTop + backH + seatH - tableH;

  return (
    <div
      style={{
        width: containerW,
        height: containerH,
        perspective: "480px",
        perspectiveOrigin: "50% 18%",
        margin: "0 auto",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── 3D stage ─────────────────────────────── */}
      <div style={{ position: "absolute", left: "50%", top: 0, transformStyle: "preserve-3d" }}>

        {/* Left card panel */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: panelW,
            height: panelH,
            background: "linear-gradient(90deg, #f2e8d9 0%, #fdf8f2 100%)",
            border: "1px solid #d4c5a9",
            transformOrigin: "right center",
            transform: `rotateY(${angle}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Chair left — fixed distance from spine (right edge of left panel) */}
          <div style={{ position: "absolute", right: attach, top: chairTop, width: chairW, height: backH + seatH }}>
            <ChairShape photo={photoLeft} chairW={chairW} backH={backH} seatH={seatH} />
          </div>
        </div>

        {/* Right card panel */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: panelW,
            height: panelH,
            background: "linear-gradient(270deg, #f2e8d9 0%, #fdf8f2 100%)",
            border: "1px solid #d4c5a9",
            transformOrigin: "left center",
            transform: `rotateY(-${angle}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Chair right */}
          <div style={{ position: "absolute", left: attach, top: chairTop, width: chairW, height: backH + seatH }}>
            <ChairShape photo={photoRight} chairW={chairW} backH={backH} seatH={seatH} />
          </div>
        </div>

      </div>

      {/* ── Table — screen-space overlay centred on the spine ── */}
      {/* Positioned after the 3D stage so it renders on top */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: tableScrY,
          transform: "translateX(-50%)",
          width: tableW,
          height: tableH,
          background: "#c4a065",
          border: "1px solid #9a7a4e",
          borderRadius: 2,
          boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
          zIndex: 10,
        }}
      />

      {/* ── Fade-out at bottom so panels don't hard-clip ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 40,
          background: "linear-gradient(to bottom, transparent, white)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

function ChairShape({ photo, chairW, backH, seatH }: { photo?: string; chairW: number; backH: number; seatH: number }) {
  return (
    <>
      {/* Chair back — photo or placeholder */}
      <div
        style={{
          width: chairW,
          height: backH,
          background: "#e4dbd0",
          border: "1px solid #b8a98c",
          borderRadius: "2px 2px 0 0",
          overflow: "hidden",
        }}
      >
        {photo ? (
          <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.max(10, chairW * 0.4), color: "#c4b8a8" }}>
            👤
          </div>
        )}
      </div>

      {/* Chair seat */}
      <div
        style={{
          width: chairW,
          height: seatH,
          background: "#cec5b8",
          border: "1px solid #b8a98c",
          borderTop: "none",
          borderRadius: "0 0 2px 2px",
        }}
      />
    </>
  );
}
