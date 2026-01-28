"use client";

import { FiCopy } from "react-icons/fi";
import { useState } from "react";

export default function CopyLabCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors relative"
      title="Copy lab code"
    >
      <FiCopy size={18} />

      {copied && (
        <span className="absolute -top-7 right-1/2 translate-x-1/2 text-xs px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-white shadow-lg">
          Copied
        </span>
      )}
    </button>
  );
}
