"use client";

import { useState, useRef, useEffect } from "react";
import { FaEllipsisVertical } from "react-icons/fa6";
import { LabType } from "@/types/labType";
import { deleteLab } from "@/actions/classroom-actions/lab";
import EditLabModal from "./modals/EditLabModal";
import { createPortal } from "react-dom";

export default function LabActionMenu({
  lab,
  userEmail,
}: {
  lab: LabType;
  userEmail: string;
}) {
  const [open, setOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleDelete() {
    setOpen(false);
    await deleteLab(lab.id, userEmail);
  }

  return (
    <>
      <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
        >
          <FaEllipsisVertical size={16} />
        </button>

        {open && (
          <div className="absolute right-0 bottom-12 w-40 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
            <button
              onClick={() => {
                setOpen(false);
                setIsEditOpen(true);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Edit
            </button>

            <button
              onClick={handleDelete}
              className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Delete
            </button>

            <button
              className="w-full px-4 py-2.5 text-left text-sm text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Archive
            </button>
          </div>
        )}
      </div>

      {/* 🔥 PORTAL FIX */}
      {isEditOpen &&
        createPortal(
          <EditLabModal
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            lab={lab}
            userEmail={userEmail}
          />,
          document.body
        )}
    </>
  );
}
