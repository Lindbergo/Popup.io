"use client";

import { useEffect, useMemo, useState } from "react";
import type { CardDesign } from "@/types/card";
import { generateSVG, generatePrintHTML } from "@/lib/svg-template";
import { generatePDF } from "@/lib/pdf-template";

interface CardResultProps {
  design: CardDesign;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-red-100 text-red-700",
};

const TABS = [
  { id: "guide", label: "Step-by-Step Guide" },
  { id: "materials", label: "Materials" },
  { id: "template", label: "Print Template" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default function CardResult({ design }: CardResultProps) {
  const [activeTab, setActiveTab] = useState<Tab>("guide");
  const [exportingPDF, setExportingPDF] = useState(false);

  const svgString = useMemo(() => generateSVG(design), [design]);

  const [svgPreviewUrl, setSvgPreviewUrl] = useState<string>("");
  useEffect(() => {
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    setSvgPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [svgString]);

  function downloadTemplate() {
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${design.title.replace(/\s+/g, "-")}-template.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadPDF() {
    setExportingPDF(true);
    try {
      const bytes = await generatePDF(design);
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${design.title.replace(/\s+/g, "-")}-template.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportingPDF(false);
    }
  }

  function printTemplate() {
    const html = generatePrintHTML(design);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    // Trigger print once the page has loaded
    if (win) {
      win.onload = () => {
        win.print();
        URL.revokeObjectURL(url);
      };
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
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
              DIFFICULTY_COLORS[design.difficulty] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {design.difficulty}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {design.mechanisms_used.map((m) => (
            <span
              key={m}
              className="rounded-full bg-white border border-rose-200 px-3 py-0.5 text-xs text-rose-600 font-medium"
            >
              {m.replace(/-/g, " ")}
            </span>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-500">
          <div className="rounded-xl bg-white border border-gray-100 p-3">
            <div className="font-semibold text-gray-700 mb-0.5">Flat</div>
            <div>
              {design.card_size.flat_width_mm} × {design.card_size.flat_height_mm} mm
            </div>
          </div>
          <div className="rounded-xl bg-white border border-gray-100 p-3">
            <div className="font-semibold text-gray-700 mb-0.5">Folded</div>
            <div>
              {design.card_size.folded_width_mm} × {design.card_size.folded_height_mm} mm
            </div>
          </div>
        </div>
      </div>

      {/* Photo placements — shown only when present */}
      {design.photo_placements && design.photo_placements.length > 0 && (
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📸</span>
            <span className="font-semibold text-violet-900">
              Your photo{design.photo_placements.length > 1 ? "s" : ""} — here's exactly where they go
            </span>
          </div>
          {design.photo_placements.map((p, i) => (
            <div
              key={i}
              className="rounded-xl bg-white border border-violet-100 p-4 flex gap-4 items-start"
            >
              <div className="shrink-0 w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-sm font-bold flex items-center justify-center">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="font-semibold text-sm text-gray-900">
                  Attach to: {p.piece_label}
                </div>
                <div className="text-xs text-gray-500">
                  Print size: <span className="font-medium text-gray-700">{p.print_width_mm} × {p.print_height_mm} mm</span>
                  &nbsp;·&nbsp; Position: <span className="font-medium text-gray-700">{p.position_on_piece}</span>
                  &nbsp;·&nbsp; Do this at <span className="font-medium text-gray-700">Step {p.attach_at_step}</span>
                </div>
                {p.notes && (
                  <div className="text-xs text-violet-700 italic">{p.notes}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Technique summary */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-600">
        <div className="font-semibold text-gray-800 mb-1">Why these mechanisms?</div>
        {design.technique_summary}
      </div>

      {/* Tabs */}
      <div>
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-rose-500 text-rose-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Step-by-Step Guide */}
        {activeTab === "guide" && (
          <div className="mt-4 space-y-3">
            {design.steps.map((step) => (
              <div
                key={step.step}
                className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4"
              >
                <div className="shrink-0 w-7 h-7 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center">
                  {step.step}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 text-sm">{step.title}</div>
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed">{step.instruction}</p>
                  {step.tip && (
                    <div className="mt-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-800">
                      <span className="font-semibold">Tip: </span>
                      {step.tip}
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

        {/* Materials */}
        {activeTab === "materials" && (
          <div className="mt-4 space-y-2">
            {design.materials.map((mat, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4"
              >
                <div className="shrink-0 w-7 h-7 rounded-lg bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center">
                  {mat.quantity}x
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-800">{mat.piece}</div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    {mat.width_mm} × {mat.height_mm} mm &nbsp;·&nbsp; {mat.weight_lb} lb
                    cardstock &nbsp;·&nbsp; {mat.color}
                  </div>
                  {mat.notes && (
                    <div className="mt-1 text-xs text-gray-400 italic">{mat.notes}</div>
                  )}
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-500">
              <div className="font-semibold text-gray-700 mb-1">Tools needed</div>
              Scoring tool or bone folder · Metal ruler · Craft knife (X-acto) · Cutting mat ·
              PVA glue or double-sided tape · Pencil
            </div>
          </div>
        )}

        {/* Print Template */}
        {activeTab === "template" && (
          <div className="mt-4 space-y-4">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3 text-xs text-gray-600">
              {[
                { color: "#e53e3e", label: "Cut line", dash: false },
                { color: "#3182ce", label: "Valley fold", dash: true },
                { color: "#38a169", label: "Mountain fold", dash: true },
                { color: "#a0aec0", label: "Score line", dash: true },
                { color: "#f6e05e", label: "Glue zone", dash: false, fill: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  {item.fill ? (
                    <span
                      className="inline-block w-5 h-3 rounded-sm border"
                      style={{ background: item.color, borderColor: item.color }}
                    />
                  ) : (
                    <span
                      className="inline-block w-5 border-t-2"
                      style={{
                        borderColor: item.color,
                        borderStyle: item.dash ? "dashed" : "solid",
                      }}
                    />
                  )}
                  {item.label}
                </div>
              ))}
            </div>

            {/* SVG preview */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              {svgPreviewUrl && (
                <img
                  src={svgPreviewUrl}
                  alt="Printable card template"
                  className="w-full h-auto block"
                  style={{ imageRendering: "crisp-edges" }}
                />
              )}
            </div>

            {/* Print check callout */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 space-y-1">
              <div className="font-semibold text-amber-800">Before you cut anything</div>
              <p>The template includes a <strong>PRINT CHECK square</strong> in the bottom-right corner. After printing, measure it with a ruler. It must be exactly <strong>50×50mm</strong>. If it&apos;s any other size, your printer scaled the output — reprint before cutting.</p>
            </div>

            {/* Browser-specific print instructions */}
            <div className="rounded-xl border border-gray-100 bg-white divide-y divide-gray-100 text-xs overflow-hidden">
              <div className="px-4 py-3 font-semibold text-gray-700 bg-gray-50">
                How to print at actual size — by browser
              </div>
              {[
                {
                  browser: "Chrome / Edge",
                  steps: 'Click Print → More settings → Scale: Custom → type "100" → Print',
                },
                {
                  browser: "Firefox",
                  steps: 'Click Print → Scale: 100% → Print',
                },
                {
                  browser: "Safari (Mac)",
                  steps: 'File → Print → Paper Handling → Scale to fit paper: OFF → Print',
                },
                {
                  browser: "Windows (any browser)",
                  steps: 'Print dialog → Page setup → Scale: 100% → no margins → Print',
                },
              ].map((row) => (
                <div key={row.browser} className="px-4 py-2.5 flex gap-3">
                  <span className="shrink-0 font-semibold text-gray-600 w-32">{row.browser}</span>
                  <span className="text-gray-500">{row.steps}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={printTemplate}
                className="flex-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 text-sm transition-all"
              >
                Print Template
              </button>
              <button
                onClick={downloadPDF}
                disabled={exportingPDF}
                className="flex-1 rounded-xl bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 text-sm transition-all"
              >
                {exportingPDF ? "Generating PDF…" : "Download PDF"}
              </button>
              <button
                onClick={downloadTemplate}
                className="flex-1 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 text-sm transition-all"
              >
                Download SVG
              </button>
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
    </div>
  );
}
