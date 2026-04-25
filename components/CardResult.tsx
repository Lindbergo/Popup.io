"use client";

import { useState } from "react";
import type { CardDesign } from "@/types/card";

interface CardResultProps {
  design: CardDesign;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-red-100 text-red-700",
};

export default function CardResult({ design }: CardResultProps) {
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [activeTab, setActiveTab] = useState<"guide" | "materials">("guide");

  async function downloadTemplate() {
    setDownloadingTemplate(true);
    try {
      const res = await fetch("/api/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(design),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${design.title.replace(/\s+/g, "-")}-template.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingTemplate(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{design.title}</h2>
            <p className="mt-1 text-sm text-gray-600 leading-relaxed">{design.concept}</p>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${DIFFICULTY_COLORS[design.difficulty] ?? "bg-gray-100 text-gray-600"}`}>
            {design.difficulty}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {design.mechanisms_used.map((m) => (
            <span key={m} className="rounded-full bg-white border border-rose-200 px-3 py-0.5 text-xs text-rose-600 font-medium">
              {m.replace(/-/g, " ")}
            </span>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-500">
          <div className="rounded-xl bg-white border border-gray-100 p-3">
            <div className="font-semibold text-gray-700 mb-0.5">Card size (flat)</div>
            <div>{design.card_size.flat_width_mm} × {design.card_size.flat_height_mm} mm</div>
          </div>
          <div className="rounded-xl bg-white border border-gray-100 p-3">
            <div className="font-semibold text-gray-700 mb-0.5">Card size (folded)</div>
            <div>{design.card_size.folded_width_mm} × {design.card_size.folded_height_mm} mm</div>
          </div>
        </div>
      </div>

      {/* Technique summary */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-600">
        <div className="font-semibold text-gray-800 mb-1">Why these mechanisms?</div>
        {design.technique_summary}
      </div>

      {/* Tabs */}
      <div>
        <div className="flex border-b border-gray-200">
          {(["guide", "materials"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-rose-500 text-rose-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "guide" ? "Step-by-Step Guide" : "Materials List"}
            </button>
          ))}
        </div>

        {activeTab === "guide" && (
          <div className="mt-4 space-y-3">
            {design.steps.map((step) => (
              <div key={step.step} className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4">
                <div className="shrink-0 w-7 h-7 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center">
                  {step.step}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 text-sm">{step.title}</div>
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed">{step.instruction}</p>
                  {step.tip && (
                    <div className="mt-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-800">
                      <span className="font-semibold">Tip: </span>{step.tip}
                    </div>
                  )}
                  {step.mechanism && (
                    <span className="mt-2 inline-block text-xs text-gray-400 italic">
                      [{step.mechanism.replace(/-/g, " ")}]
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "materials" && (
          <div className="mt-4 space-y-2">
            {design.materials.map((mat, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4">
                <div className="shrink-0 w-7 h-7 rounded-lg bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center">
                  {mat.quantity}x
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-800">{mat.piece}</div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    {mat.width_mm} × {mat.height_mm} mm &nbsp;·&nbsp; {mat.weight_lb} lb cardstock &nbsp;·&nbsp; {mat.color}
                  </div>
                  {mat.notes && (
                    <div className="mt-1 text-xs text-gray-400 italic">{mat.notes}</div>
                  )}
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-500 space-y-1">
              <div className="font-semibold text-gray-700 mb-1">Tools needed</div>
              <div>Scoring tool or bone folder · Metal ruler · Craft knife (X-acto) · Cutting mat · PVA glue or double-sided tape · Pencil</div>
            </div>
          </div>
        )}
      </div>

      {/* Design notes */}
      {design.design_notes && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
          <div className="font-semibold mb-1">Design notes</div>
          {design.design_notes}
        </div>
      )}

      {/* Download template */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="font-semibold text-gray-800 mb-1">Printable Template</div>
        <p className="text-sm text-gray-500 mb-4">
          Download the SVG template with all pieces laid out. Print at 100% scale (do not &quot;fit to page&quot;). Red lines = cut, blue dashed = valley fold, green dash-dot = mountain fold.
        </p>
        <button
          onClick={downloadTemplate}
          disabled={downloadingTemplate}
          className="rounded-xl bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 text-white font-semibold px-5 py-2.5 text-sm transition-all"
        >
          {downloadingTemplate ? "Generating..." : "Download Template (SVG)"}
        </button>
      </div>
    </div>
  );
}
