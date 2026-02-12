"use client";

import { useState, useRef, useEffect } from "react";
import { FiMoreVertical, FiEdit2, FiTrash2, FiArchive } from "react-icons/fi";
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
          className={`p-2 rounded-lg transition-colors ${
            open
              ? "bg-gray-100 text-gray-700"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          }`}
          aria-label="Lab actions"
        >
          <FiMoreVertical size={15} />
        </button>

        {open && (
          <div className="absolute right-0 bottom-10 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden animate-slide-in-down">
            <button
              onClick={() => {
                setOpen(false);
                setIsEditOpen(true);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
            >
              <FiEdit2 size={13} className="text-gray-400" />
              Edit
            </button>
            <button
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
            >
              <FiArchive size={13} className="text-gray-400" />
              Archive
            </button>
            <div className="border-t border-gray-100" />
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
            >
              <FiTrash2 size={13} />
              Delete
            </button>
          </div>
        )}
      </div>

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
