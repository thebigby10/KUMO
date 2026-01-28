//src/components/UserMenu.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { logoutAction } from "../actions/auth";
import { FiLogOut, FiUser, FiSettings } from "react-icons/fi";

interface UserMenuProps {
  email: string;
  name?: string | null;
}

export default function UserMenu({ email, name }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial = (name || email).charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm transition-all ${
          isOpen 
            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white ring-2 ring-blue-400/50" 
            : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
        }`}
        title="Account settings"
      >
        {initial}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-[60] animate-in fade-in zoom-in-95 duration-100 origin-top-right">
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-sm font-semibold text-white truncate">
              {name || "Kumo User"}
            </p>
            <p className="text-xs text-slate-400 truncate mt-1">
              {email}
            </p>
          </div>

          <div className="py-2">
            <button className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 flex items-center gap-3 transition-colors">
              <FiUser size={16} />
              <span>Profile</span>
            </button>
            <button className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 flex items-center gap-3 transition-colors">
              <FiSettings size={16} />
              <span>Settings</span>
            </button>
          </div>

          <div className="border-t border-slate-700 my-2"></div>

          <form action={logoutAction} className="px-2">
            <button
              type="submit"
              className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg flex items-center gap-3 transition-colors"
            >
              <FiLogOut size={16} />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}