"use client";

import { useState, useRef } from "react";
import type { Difficulty, GenerateRequest } from "@/types/card";

interface CardInputProps {
  onGenerate: (request: GenerateRequest) => void;
  loading: boolean;
}

interface Preset {
  emoji: string;
  label: string;
  description: string;
  difficulty: Difficulty;
}

const PRESETS: Preset[] = [
  {
    emoji: "🎂",
    label: "Birthday",
    difficulty: "intermediate",
    description:
      "Birthday card for my girlfriend. We sit together at a table — the table pops up with two chairs, one for each of us. I'll paste our photos onto the chairs. Add a small birthday cake on the table.",
  },
  {
    emoji: "👶",
    label: "Baby Shower",
    difficulty: "intermediate",
    description:
      "Baby shower card. A baby crib pops up in the center with a mobile hanging above it — small stars and moons on the mobile. Soft pastel colors, pink or yellow. 'Welcome Baby' text floating in the background.",
  },
  {
    emoji: "💍",
    label: "Anniversary",
    difficulty: "beginner",
    description:
      "Anniversary card for a couple. Two hearts rise up from the center and meet at the top. A small banner between them reads 'Happy Anniversary'. Elegant, simple, red and gold colors.",
  },
  {
    emoji: "🏠",
    label: "Housewarming",
    difficulty: "intermediate",
    description:
      "Housewarming card for friends who just moved in. A house pops up with two floors, a front door, windows, and a chimney with a smoke curl. A welcome mat at the door. Warm colors.",
  },
  {
    emoji: "🎓",
    label: "Graduation",
    difficulty: "beginner",
    description:
      "Graduation card. A graduate figure stands tall holding a rolled diploma, wearing a cap and gown. A school building or arch in the background. 'Congratulations' text at the top.",
  },
  {
    emoji: "🌲",
    label: "Christmas",
    difficulty: "beginner",
    description:
      "Christmas card. A decorated Christmas tree pops up in the center — star at the top, ornaments on branches, wrapped presents underneath. Snow effect on the base. Red and green.",
  },
  {
    emoji: "💝",
    label: "Valentine's",
    difficulty: "beginner",
    description:
      "Valentine's Day card. A large heart rises from the center. Smaller hearts float around it on layered panels. 'I Love You' text in elegant script. Deep red and pink.",
  },
  {
    emoji: "🙏",
    label: "Thank You",
    difficulty: "beginner",
    description:
      "Thank you card. A bouquet of flowers pops up — roses and leaves fanning out from the center. Simple and elegant. A small tag that reads 'Thank You' on the front panel.",
  },
];

export default function CardInput({ onGenerate, loading }: CardInputProps) {
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [imageBase64, setImageBase64] = useState<string | undefined>();
  const [imageMimeType, setImageMimeType] = useState<string | undefined>();
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function applyPreset(preset: Preset) {
    setDescription(preset.description);
    setDifficulty(preset.difficulty);
    setActivePreset(preset.label);
  }

  function handleDescriptionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setDescription(e.target.value);
    setActivePreset(null);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const [header, data] = result.split(",");
      const mime = header.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
      setImageBase64(data);
      setImageMimeType(mime);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImageBase64(undefined);
    setImageMimeType(undefined);
    setImagePreview(undefined);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    onGenerate({ description, difficulty, imageBase64, imageMimeType });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Occasion presets */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Pick an occasion
        </label>
        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              disabled={loading}
              className={`flex flex-col items-center gap-1 rounded-xl border py-3 px-1 text-xs font-medium transition-all ${
                activePreset === preset.label
                  ? "border-rose-400 bg-rose-50 text-rose-700 shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-rose-200 hover:bg-rose-50"
              }`}
            >
              <span className="text-xl leading-none">{preset.emoji}</span>
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Describe your idea{" "}
          <span className="font-normal text-gray-400">
            — or edit the suggestion above
          </span>
        </label>
        <textarea
          value={description}
          onChange={handleDescriptionChange}
          rows={4}
          placeholder="e.g. Birthday card for my girlfriend. We sit at a table together — the table pops up with two chairs..."
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 resize-none"
          disabled={loading}
        />
      </div>

      {/* Image upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Upload a reference image{" "}
          <span className="font-normal text-gray-400">(optional)</span>
        </label>
        {imagePreview ? (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Reference"
              className="h-32 rounded-xl object-cover border border-gray-200"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-3 cursor-pointer w-fit rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 px-4 py-3 text-sm text-gray-500 transition-colors">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Upload photo or inspiration image
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              className="hidden"
              disabled={loading}
            />
          </label>
        )}
        <p className="mt-1.5 text-xs text-gray-400">
          Upload a photo of yourself, your scene inspiration, or a reference
          image.
        </p>
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Difficulty level
        </label>
        <div className="flex gap-2">
          {(["beginner", "intermediate", "advanced"] as Difficulty[]).map(
            (d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                disabled={loading}
                className={`flex-1 rounded-xl border py-2 text-sm font-medium capitalize transition-all ${
                  difficulty === d
                    ? "border-rose-400 bg-rose-50 text-rose-700 shadow-sm"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}
              >
                {d}
              </button>
            )
          )}
        </div>
        <p className="mt-1.5 text-xs text-gray-400">
          Beginner: 20–40 min &nbsp;·&nbsp; Intermediate: 45–90 min
          &nbsp;·&nbsp; Advanced: 90–180 min
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !description.trim()}
        className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 text-sm transition-all shadow-sm"
      >
        {loading ? "Designing your card..." : "Generate Card Design"}
      </button>
    </form>
  );
}
