"use client";

import React from "react";
import { FiShield, FiAlertTriangle, FiCheckCircle, FiInfo } from "react-icons/fi";
import { AiDetectionResult } from "@/types/labType";

interface AiDetectionResultProps {
  result: AiDetectionResult | null;
  isLoading?: boolean;
}

export default function AiDetectionResultPanel({ result, isLoading = false }: AiDetectionResultProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full skeleton" />
          <div className="h-4 w-32 skeleton rounded" />
        </div>
        <div className="h-2.5 w-full skeleton rounded-full" />
        <div className="h-3 w-3/4 skeleton rounded" />
      </div>
    );
  }

  if (!result) return null;

  const confidencePct = Math.round(result.confidence * 100);
  const isAI = result.isAiGenerated;

  const verdict = isAI
    ? { label: "Likely AI-Generated", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", barColor: "bg-red-400" }
    : { label: "Likely Human Written", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", barColor: "bg-emerald-400" };

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${verdict.bg} ${verdict.border}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiShield className={`w-4 h-4 ${isAI ? "text-red-500" : "text-emerald-500"}`} />
          <span className={`text-sm font-semibold ${verdict.color}`}>AI Detection</span>
        </div>
        <span
          className={`
            inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border
            ${verdict.bg} ${verdict.border} ${verdict.color}
          `}
        >
          {isAI ? <FiAlertTriangle className="w-3 h-3" /> : <FiCheckCircle className="w-3 h-3" />}
          {verdict.label}
        </span>
      </div>

      {/* Confidence bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-xs font-medium ${verdict.color}`}>Confidence</span>
          <span className={`text-xs font-bold font-mono ${verdict.color}`}>{confidencePct}%</span>
        </div>
        <div className="w-full bg-white/60 rounded-full h-2 border border-white/80">
          <div
            className={`h-2 rounded-full transition-all duration-700 ${verdict.barColor}`}
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>

      {/* Reasoning */}
      {result.reasoning && (
        <div className="flex gap-2">
          <FiInfo className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${verdict.color} opacity-70`} />
          <p className={`text-xs leading-relaxed ${verdict.color} opacity-80`}>
            {result.reasoning}
          </p>
        </div>
      )}
    </div>
  );
}
