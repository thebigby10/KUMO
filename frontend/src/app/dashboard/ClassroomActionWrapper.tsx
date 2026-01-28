// src/app/dashboard/ClassroomActionWrapper.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import CreateLabModal from "@/components/modals/CreateLabModal";
import JoinLabModal from "@/components/modals/JoinLabModal";

export default function ClassroomActionWrapper({
  userEmail,
}: {
  userEmail: string;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openCreate = () => {
    setIsDropdownOpen(false);
    setIsCreateModalOpen(true);
  };

  const openJoin = () => {
    setIsDropdownOpen(false);
    setIsJoinModalOpen(true);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsDropdownOpen((v) => !v)}
        title="Create or join a lab"
        className={`
          p-2 rounded-xl transition-all duration-200
          ${
            isDropdownOpen
              ? "bg-slate-800 text-white rotate-45"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }
        `}
      >
        <Plus size={22} />
      </button>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div
          className="
            absolute right-0 mt-3 w-48
            bg-slate-900 border border-slate-700
            rounded-xl shadow-xl
            z-[60]
            overflow-hidden
            animate-in fade-in zoom-in-95 duration-150
            origin-top-right
          "
        >
          <button
            onClick={openJoin}
            className="
              w-full text-left px-4 py-3 text-sm
              text-slate-300
              hover:bg-slate-800 hover:text-white
              transition-colors
            "
          >
            Join lab
          </button>

          <button
            onClick={openCreate}
            className="
              w-full text-left px-4 py-3 text-sm
              text-slate-300
              hover:bg-slate-800 hover:text-white
              transition-colors
            "
          >
            Create lab
          </button>
        </div>
      )}

      {/* Modals (unchanged) */}
      <CreateLabModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userEmail={userEmail}
      />

      <JoinLabModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        userEmail={userEmail}
      />
    </div>
  );
}
