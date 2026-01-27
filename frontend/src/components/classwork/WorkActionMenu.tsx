// src/components/classwork/WorkActionMenu.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { FiMoreVertical, FiTrash2, FiEdit, FiBarChart2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { deleteWorkAction } from "@/actions/work";

interface WorkActionMenuProps {
  workId: string;
  labId: string;
}

export default function WorkActionMenu({ workId, labId }: WorkActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this assignment? This action cannot be undone.",
      )
    )
      return;

    setIsDeleting(true);
    const result = await deleteWorkAction(workId, labId);

    if (result?.error) {
      alert(result.error);
      setIsDeleting(false);
    } else {
      setIsOpen(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/lab/${labId}/work/${workId}/edit`);
  };

  const handleDashboard = () => {
    router.push(`/dashboard/lab/${labId}/work/${workId}/dashboard`);
  };

  return (
    <div
      className="relative"
      ref={menuRef}
      onClick={(e) => e.preventDefault()}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
      >
        <FiMoreVertical size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDashboard();
            }}
            className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700 flex items-center gap-3 transition-colors"
          >
            <FiBarChart2 size={16} />
            View Dashboard
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
            className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700 flex items-center gap-3 border-t border-slate-700/50 transition-colors"
          >
            <FiEdit size={16} />
            Edit Assignment
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            disabled={isDeleting}
            className="w-full text-left px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-3 border-t border-slate-700/50 transition-colors disabled:opacity-50"
          >
            <FiTrash2 size={16} />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
}