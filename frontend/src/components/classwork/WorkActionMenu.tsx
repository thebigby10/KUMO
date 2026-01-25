"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Trash2, Edit } from "lucide-react";
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
        "Are you sure you want to delete this assignment? This cannot be undone.",
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
      // Router refresh handled by server action revalidatePath, but safe to verify
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/lab/${labId}/work/${workId}/edit`);
  };

  return (
    <div
      className="relative ml-2"
      ref={menuRef}
      onClick={(e) => e.preventDefault()} // Prevent clicking the parent Link
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Edit size={16} />
            Edit
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            disabled={isDeleting}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
          >
            <Trash2 size={16} />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
}
