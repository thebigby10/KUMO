"use client";

import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import CreateLabModal from "@/components/CreateLabModal";
import JoinLabModal from "@/components/JoinLabModal";

export default function ClassroomActionWrapper({ userEmail }: { userEmail: string }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
      {/* The Plus Button */}
      <button 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`p-2 rounded-full transition duration-200 ${isDropdownOpen ? 'bg-gray-100 rotate-90' : 'hover:bg-gray-100 text-gray-600'}`}
        title="Create or join a class"
      >
        <Plus size={24} />
      </button>

      {/* The Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
          <button
            onClick={openJoin}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            Join class
          </button>
          <button
            onClick={openCreate}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            Create class
          </button>
        </div>
      )}

      {/* The Modals (Hidden by default) */}
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