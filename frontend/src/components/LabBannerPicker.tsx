"use client";

import { useState } from "react";
import { FiImage, FiLink } from "react-icons/fi";

const PREDEFINED_BANNERS = [
  { id: "default-pink", class: "bg-gradient-to-br from-pink-400 via-rose-400 to-pink-600" },
  { id: "blue", class: "bg-gradient-to-br from-blue-400 via-indigo-400 to-blue-600" },
  { id: "emerald", class: "bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-600" },
  { id: "amber", class: "bg-gradient-to-br from-amber-400 via-orange-400 to-amber-600" },
  { id: "purple", class: "bg-gradient-to-br from-purple-400 via-fuchsia-400 to-purple-600" },
  { id: "slate", class: "bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800" },
];

interface LabBannerPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function LabBannerPicker({ value, onChange }: LabBannerPickerProps) {
  const [mode, setMode] = useState<"preset" | "url">(
    value && value.startsWith("http") ? "url" : "preset"
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Class Banner</label>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setMode("preset")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              mode === "preset"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FiImage className="w-3.5 h-3.5" />
            Presets
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              mode === "url"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FiLink className="w-3.5 h-3.5" />
            Image URL
          </button>
        </div>
      </div>

      {mode === "preset" ? (
        <div className="grid grid-cols-3 gap-3">
          {PREDEFINED_BANNERS.map((banner) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => onChange(banner.class)}
              className={`h-16 rounded-xl border-2 transition-all ${
                value === banner.class
                  ? "border-pink-500 shadow-md scale-105"
                  : "border-transparent hover:scale-105"
              } ${banner.class}`}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={value.startsWith("http") ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400/40 focus:border-pink-400 transition-all"
          />
          {value.startsWith("http") && (
            <div className="relative h-24 rounded-xl overflow-hidden border border-gray-200">
              <img
                src={value}
                alt="Banner preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x200?text=Invalid+Image+URL';
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
