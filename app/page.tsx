"use client";

import { useState } from "react";
import CardInput from "@/components/CardInput";
import CardResult from "@/components/CardResult";
import SceneBuilder from "@/components/SceneBuilder";
import type { CardDesign, GenerateRequest } from "@/types/card";

type Mode = "ai" | "scene";

export default function Home() {
  const [mode, setMode]       = useState<Mode>("scene");
  const [design, setDesign]   = useState<CardDesign | null>(null);
  const [photos, setPhotos]   = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleAIGenerate(request: GenerateRequest) {
    setLoading(true);
    setError(null);
    setDesign(null);
    setPhotos(new Map());
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      setDesign(data as CardDesign);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleSceneBuild(builtDesign: CardDesign, builtPhotos: Map<string, string>) {
    setDesign(builtDesign);
    setPhotos(builtPhotos);
    setError(null);
  }

  function handleReset() {
    setDesign(null);
    setPhotos(new Map());
    setError(null);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-white">
      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-1.5 text-sm font-medium text-rose-600 mb-4">
            Pop-up card designer
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Popup<span className="text-rose-500">.io</span>
          </h1>
          <p className="mt-3 text-gray-500 text-base leading-relaxed max-w-md mx-auto">
            Build a pop-up card from a proven scene template — or let AI design one from your description.
          </p>
        </div>

        {/* Input */}
        {!design && !loading && (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            {/* Mode tabs */}
            <div className="flex border-b border-gray-100">
              {([
                { id: "scene" as Mode, label: "Scene Builder", sub: "Instant · no AI" },
                { id: "ai"    as Mode, label: "AI Describe",   sub: "Free-text · 20-40s" },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMode(tab.id)}
                  className={`flex-1 py-3 text-center transition-colors ${
                    mode === tab.id
                      ? "bg-rose-50 border-b-2 border-rose-500"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className={`text-sm font-semibold ${mode === tab.id ? "text-rose-600" : "text-gray-600"}`}>
                    {tab.label}
                  </div>
                  <div className="text-xs text-gray-400">{tab.sub}</div>
                </button>
              ))}
            </div>

            <div className="p-6">
              {mode === "scene" ? (
                <SceneBuilder onBuild={handleSceneBuild} />
              ) : (
                <CardInput onGenerate={handleAIGenerate} loading={loading} />
              )}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-10 text-center">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full border-4 border-rose-100 border-t-rose-500 animate-spin" />
              <div>
                <div className="font-semibold text-gray-800">Designing your card...</div>
                <div className="text-sm text-gray-400 mt-1">Selecting mechanisms, calculating dimensions, generating template</div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            <div className="font-semibold mb-1">Something went wrong</div>
            {error}
            <button
              onClick={() => setError(null)}
              className="mt-3 block text-red-500 hover:text-red-700 underline text-xs"
            >
              Try again
            </button>
          </div>
        )}

        {/* Result */}
        {design && (
          <div>
            <button
              onClick={handleReset}
              className="mb-5 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Design another card
            </button>
            <CardResult design={design} photos={photos} />
          </div>
        )}

        <div className="mt-12 text-center text-xs text-gray-400">
          Popup.io — Built on proven paper engineering techniques
        </div>
      </div>
    </main>
  );
}
