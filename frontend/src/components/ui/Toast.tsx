"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX, FiAlertTriangle } from "react-icons/fi";

// ── Types ─────────────────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

// ── Styles ────────────────────────────────────────────────────────────────────
const typeConfig: Record<
  ToastType,
  { icon: React.ElementType; bg: string; border: string; text: string; iconColor: string }
> = {
  success: {
    icon: FiCheckCircle,
    bg: "bg-white",
    border: "border-emerald-200",
    text: "text-gray-900",
    iconColor: "text-emerald-500",
  },
  error: {
    icon: FiAlertCircle,
    bg: "bg-white",
    border: "border-red-200",
    text: "text-gray-900",
    iconColor: "text-red-500",
  },
  info: {
    icon: FiInfo,
    bg: "bg-white",
    border: "border-blue-200",
    text: "text-gray-900",
    iconColor: "text-blue-500",
  },
  warning: {
    icon: FiAlertTriangle,
    bg: "bg-white",
    border: "border-amber-200",
    text: "text-gray-900",
    iconColor: "text-amber-500",
  },
};

// ── Single Toast Item ──────────────────────────────────────────────────────────
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const config = typeConfig[toast.type];
  const Icon = config.icon;

  React.useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={`
        flex items-start gap-3 w-80 p-4 rounded-xl border shadow-lg
        animate-toast-in
        ${config.bg} ${config.border} ${config.text}
      `}
      role="alert"
      aria-live="polite"
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Dismiss"
      >
        <FiX size={14} />
      </button>
    </div>
  );
}

// ── Provider ───────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-4), { ...opts, id }]); // max 5 toasts
  }, []);

  const ctx: ToastContextValue = {
    toast: add,
    success: (title, message) => add({ type: "success", title, message }),
    error: (title, message) => add({ type: "error", title, message }),
    info: (title, message) => add({ type: "info", title, message }),
    warning: (title, message) => add({ type: "warning", title, message }),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Toast Container */}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
