//src/components/UserMenu.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { logoutAction } from "../actions/auth";
import { FiLogOut, FiUser, FiSettings, FiChevronDown } from "react-icons/fi";

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
        className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all border ${
          isOpen
            ? "bg-pink-50 border-pink-200 text-pink-700"
            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
        }`}
        title="Account settings"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center font-semibold text-xs">
          {initial}
        </div>
        <span className="text-sm font-medium hidden sm:inline max-w-28 truncate">
          {name || email.split("@")[0]}
        </span>
        <FiChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-[60] animate-slide-in-down">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center font-bold text-sm">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {name || "KUMO User"}
                </p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{email}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-3 transition-colors">
              <FiUser size={15} className="text-gray-400" />
              <span>Profile</span>
            </button>
            <button className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-3 transition-colors">
              <FiSettings size={15} className="text-gray-400" />
              <span>Settings</span>
            </button>
          </div>

          <div className="border-t border-gray-100 mt-1 pt-1">
            <form action={logoutAction} className="px-2">
              <button
                type="submit"
                role="menuitem"
                className="w-full text-left px-3 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-3 transition-colors"
              >
                <FiLogOut size={15} />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}