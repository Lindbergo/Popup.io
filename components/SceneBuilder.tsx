"use client";

import { useState, useRef } from "react";
import { SCENES } from "@/lib/scenes";
import type { Scene, SceneParams } from "@/lib/scenes";
import type { CardDesign } from "@/types/card";
import BirthdayTablePreview from "@/components/BirthdayTablePreview";
import type { BirthdayTableParams } from "@/lib/scenes/birthday-table";

interface SceneBuilderProps {
  onBuild: (design: CardDesign, photos: Map<string, string>, preview: React.ReactNode) => void;
}

// Map scene id → preview renderer (add entries here when new scenes are added)
function renderScenePreview(sceneId: string, params: SceneParams, photos: Map<string, string>): React.ReactNode {
  if (sceneId === "birthday-table") {
    return <BirthdayTablePreview params={params as BirthdayTableParams} photos={photos} />;
  }
  return null;
}

export default function SceneBuilder({ onBuild }: SceneBuilderProps) {
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [params, setParams] = useState<SceneParams>({} as any);
  const [photos, setPhotos] = useState<Map<string, string>>(new Map());
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function selectScene(scene: Scene) {
    setSelectedScene(scene);
    setParams({ ...scene.defaultParams });
    setPhotos(new Map());
  }

  function setParam(key: string, value: number | string) {
    setParams((prev) => ({ ...prev, [key]: value }));
  }

  function handlePhotoUpload(slotId: string, file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPhotos((prev) => new Map(prev).set(slotId, dataUrl));
    };
    reader.readAsDataURL(file);
  }

  function removePhoto(slotId: string) {
    setPhotos((prev) => {
      const next = new Map(prev);
      next.delete(slotId);
      return next;
    });
  }

  function handleBuild() {
    if (!selectedScene) return;
    const design  = selectedScene.generate(params);
    const preview = renderScenePreview(selectedScene.id, params, photos);
    onBuild(design, photos, preview);
  }

  if (!selectedScene) {
    return (
      <div>
        <p className="text-sm text-gray-500 mb-4">Choose a scene — the geometry is calculated automatically, no AI needed.</p>
        <div className="grid gap-3">
          {SCENES.map((scene) => (
            <button
              key={scene.id}
              onClick={() => selectScene(scene)}
              className="flex items-start gap-3 w-full text-left rounded-xl border border-gray-200 p-4 hover:border-rose-300 hover:bg-rose-50 transition-colors"
            >
              <span className="text-3xl">{scene.emoji}</span>
              <div>
                <div className="font-semibold text-gray-800">{scene.name}</div>
                <div className="text-sm text-gray-500 mt-0.5">{scene.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const validation = selectedScene.validate(params);

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => setSelectedScene(null)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to scenes
      </button>

      <div className="flex items-center gap-2 mb-5">
        <span className="text-2xl">{selectedScene.emoji}</span>
        <h2 className="font-bold text-gray-800 text-lg">{selectedScene.name}</h2>
      </div>

      {/* Parameters */}
      <div className="space-y-4 mb-6">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dimensions</div>
        {selectedScene.paramSchema.map((field) => (
          <div key={field.key}>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700">{field.label}</label>
              {field.type === "range" && (
                <span className="text-sm text-rose-600 font-semibold tabular-nums">
                  {params[field.key]}{field.unit}
                </span>
              )}
            </div>
            {field.type === "range" ? (
              <input
                type="range"
                min={field.min}
                max={field.max}
                step={field.step}
                value={params[field.key] as number}
                onChange={(e) => setParam(field.key, Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            ) : (
              <select
                value={params[field.key] as string}
                onChange={(e) => setParam(field.key, e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      {/* Validation warnings */}
      {!validation.ok && (
        <div className="mb-5 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700 space-y-1">
          {validation.warnings.map((w, i) => <div key={i}>⚠ {w}</div>)}
        </div>
      )}

      {/* Photo slots */}
      {selectedScene.photoSlots.length > 0 && (
        <div className="mb-6">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Photos</div>
          <div className="space-y-3">
            {selectedScene.photoSlots.map((slot) => {
              const hasPhoto = photos.has(slot.id);
              return (
                <div key={slot.id} className="rounded-xl border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-medium text-gray-700">{slot.label}</div>
                      <div className="text-xs text-gray-400">{slot.hint}</div>
                    </div>
                    {hasPhoto && (
                      <button onClick={() => removePhoto(slot.id)} className="text-xs text-gray-400 hover:text-red-500">
                        Remove
                      </button>
                    )}
                  </div>
                  {hasPhoto ? (
                    <div className="relative h-24 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={photos.get(slot.id)}
                        alt={slot.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => fileRefs.current[slot.id]?.click()}
                      className="w-full h-20 rounded-lg border-2 border-dashed border-gray-200 hover:border-rose-300 hover:bg-rose-50 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-rose-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-xs">Upload photo</span>
                    </button>
                  )}
                  <input
                    ref={(el) => { fileRefs.current[slot.id] = el; }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(slot.id, file);
                      e.target.value = "";
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live scene preview */}
      <div className="mb-5">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Preview</div>
        <div className="rounded-xl border border-gray-100 bg-white py-4 overflow-hidden">
          {renderScenePreview(selectedScene.id, params, photos)}
        </div>
      </div>

      <button
        onClick={handleBuild}
        disabled={!validation.ok}
        className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 text-sm transition-colors"
      >
        Build Template
      </button>
    </div>
  );
}
