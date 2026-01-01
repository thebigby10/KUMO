"use client";

import { useState, useRef, useEffect } from "react";
import { logoutAction } from "../actions/auth";
import { LogOut, User } from "lucide-react";

interface UserMenuProps {
  email: string;
  name?: string | null;
}

export default function UserMenu({ email, name }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get initial for avatar
  const initial = email.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      {/* 1. The Trigger (Avatar) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium transition shadow-sm outline-none ring-offset-2 focus:ring-2 focus:ring-blue-500 ${
          isOpen ? "ring-2 ring-blue-500 bg-purple-800" : "bg-purple-700 hover:bg-purple-800"
        }`}
        title="Account settings"
      >
        {initial}
      </button>

      {/* 2. The Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
          
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {name || "Kumo User"}
            </p>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <User size={16} />
              <span>Profile</span>
            </button>
          </div>

          <div className="border-t border-gray-100 my-1"></div>

          {/* Logout Action */}
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}