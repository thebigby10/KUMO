// src/app/dashboard/ClassroomActionWrapper.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, BookOpen, Users } from "lucide-react";
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
          inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
          transition-all border
          ${
            isDropdownOpen
              ? "bg-pink-500 text-white border-pink-500 shadow-sm"
              : "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100"
          }
        `}
      >
        <Plus size={16} className={`transition-transform ${isDropdownOpen ? "rotate-45" : ""}`} />
        <span>New</span>
      </button>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-[60] animate-slide-in-down">
          <button
            onClick={openJoin}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-3 transition-colors"
          >
            <Users size={15} className="text-gray-400" />
            Join lab
          </button>
          <button
            onClick={openCreate}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-3 transition-colors"
          >
            <BookOpen size={15} className="text-gray-400" />
            Create lab
          </button>
        </div>
      )}

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
