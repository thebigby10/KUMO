"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiChevronDown,
  FiChevronRight,
  FiBook,
  FiUsers,
  FiArchive,
  FiSettings,
} from "react-icons/fi";
import { LabType } from "@/types/labType";

/** Returns the Tailwind class string for primary sidebar nav links. */
function primaryNavLinkClass(isActive: boolean): string {
  return `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
    isActive
      ? "bg-pink-50 text-pink-700 border border-pink-200"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent"
  }`;
}

/** Returns the Tailwind class string for lab list items in the sidebar. */
function labNavLinkClass(isActive: boolean, activeColor: "pink" | "blue"): string {
  const activeStyles =
    activeColor === "pink"
      ? "bg-pink-50 text-pink-700 border border-pink-200"
      : "bg-blue-50 text-blue-700 border border-blue-200";
  return `flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-sm ${
    isActive ? activeStyles : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent"
  }`;
}

/** Returns the Tailwind class string for a lab avatar badge. */
function labAvatarClass(isActive: boolean, activeColor: "pink" | "blue"): string {
  const activeStyles =
    activeColor === "pink" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700";
  return `w-7 h-7 rounded-lg flex items-center justify-center font-semibold text-xs shrink-0 ${
    isActive ? activeStyles : "bg-gray-100 text-gray-600"
  }`;
}

const navItems = [
  { href: "/dashboard", icon: FiHome, label: "Dashboard" },
];

const bottomNavItems = [
  { href: "/dashboard/archived", icon: FiArchive, label: "Archived Labs" },
  { href: "/dashboard/settings", icon: FiSettings, label: "Settings" },
];

export default function DashboardLayoutClient({
  children,
  navbar,
  labs,
  userEmail,
}: {
  children: React.ReactNode;
  navbar: React.ReactNode;
  labs: LabType[];
  userEmail: string;
}) {
  const pathname = usePathname();
  const [teachingOpen, setTeachingOpen] = useState(true);
  const [enrolledOpen, setEnrolledOpen] = useState(true);

  const teachingLabs = labs.filter((lab) =>
    lab.instructors.some((inst) => inst.userEmail === userEmail)
  );

  const enrolledLabs = labs.filter(
    (lab) => !lab.instructors.some((inst) => inst.userEmail === userEmail)
  );

  const labID = pathname.split("/dashboard/lab/")[1]?.split("/")[0];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 fixed h-full overflow-y-auto z-30 flex flex-col">
        <div className="py-4 flex-1">
          {/* Primary Nav */}
          <nav className="px-3 space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-pink-50 text-pink-700 border border-pink-200"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mx-3 my-4 border-t border-gray-100" />

          {/* Teaching Labs */}
          <div className="px-3">
            <button
              onClick={() => setTeachingOpen(!teachingOpen)}
              className="flex items-center gap-2 px-3 py-2 w-full text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
            >
              <FiBook size={13} />
              <span className="flex-1 text-left">Teaching</span>
              {teachingOpen ? (
                <FiChevronDown size={12} />
              ) : (
                <FiChevronRight size={12} />
              )}
            </button>

            {teachingOpen && (
              <div className="mt-1 space-y-0.5">
                {teachingLabs.length === 0 ? (
                  <div className="px-3 py-3 text-xs text-gray-400 italic">
                    No teaching labs yet
                  </div>
                ) : (
                  teachingLabs.map((lab) => (
                    <Link
                      key={lab?.id}
                      href={`/dashboard/lab/${lab?.id}`}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-sm ${
                        labID === lab?.id
                          ? "bg-pink-50 text-pink-700 border border-pink-200"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-semibold text-xs shrink-0 ${
                          labID === lab?.id
                            ? "bg-pink-100 text-pink-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {lab?.name[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium truncate">{lab?.name}</span>
                        {lab?.section && (
                          <span className="text-[11px] text-gray-400 truncate">{lab.section}</span>
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Enrolled Labs */}
          <div className="px-3 mt-4">
            <button
              onClick={() => setEnrolledOpen(!enrolledOpen)}
              className="flex items-center gap-2 px-3 py-2 w-full text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
            >
              <FiUsers size={13} />
              <span className="flex-1 text-left">Enrolled</span>
              {enrolledOpen ? (
                <FiChevronDown size={12} />
              ) : (
                <FiChevronRight size={12} />
              )}
            </button>

            {enrolledOpen && (
              <div className="mt-1 space-y-0.5">
                {enrolledLabs.length === 0 ? (
                  <div className="px-3 py-3 text-xs text-gray-400 italic">
                    No enrolled labs yet
                  </div>
                ) : (
                  enrolledLabs.map((lab) => (
                    <Link
                      key={lab?.id}
                      href={`/dashboard/lab/${lab?.id}`}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-sm ${
                        labID === lab?.id
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-semibold text-xs shrink-0 ${
                          labID === lab?.id
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {lab?.name[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium truncate">{lab?.name}</span>
                        {lab?.section && (
                          <span className="text-[11px] text-gray-400 truncate">{lab.section}</span>
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="p-3 border-t border-gray-100">
          <nav className="space-y-0.5">
            {bottomNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
<<<<<<< HEAD
                  className={primaryNavLinkClass(isActive)}
=======
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-pink-50 text-pink-700 border border-pink-200"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-transparent"
                  }`}
>>>>>>> 93684aa (style(dashboard): convert sidebar from dark slate to white light theme)
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Sticky Top Bar */}
        <div className="sticky top-0 z-40">{navbar}</div>
        {/* Page Content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}