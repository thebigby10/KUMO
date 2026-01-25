"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FaEllipsisVertical } from "react-icons/fa6";

export default function LabActionMenu({ labId }: { labId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onClick={(e) => e.stopPropagation()} // prevent card navigation
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-full hover:bg-gray-200"
      >
        <FaEllipsisVertical />
      </button>

      {open && (
        <div className="absolute right-0 bottom-10 w-36 bg-white border border-gray-100 rounded-md shadow-lg z-50">
          <Link
            href={`/dashboard/lab/${labId}/edit`}
            className="block px-4 py-2 text-sm hover:bg-gray-100"
          >
            Edit
          </Link>

          <button
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            onClick={() => {
              setOpen(false);
              // hook delete modal / action here
              console.log("Delete lab", labId);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
