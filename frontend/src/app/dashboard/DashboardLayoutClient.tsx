"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiCalendar,
  FiArchive,
  FiSettings,
  FiChevronDown,
  FiChevronRight,
  FiBook,
  FiUsers,
} from "react-icons/fi";
import { LabType } from "@/types/labType";

const navItems = [
  { href: "/dashboard", icon: FiHome, label: "Dashboard" },
  { href: "/dashboard/calendar", icon: FiCalendar, label: "Calendar" },
];

export default function DashboardLayoutClient({
  children,
  navbar,
  labs,
  userEmail
}: {
  children: React.ReactNode;
  navbar: React.ReactNode;
  labs: LabType[];
  userEmail: string;
}) {
  const pathname = usePathname();
  const [teachingOpen, setTeachingOpen] = useState(true);
  const [enrolledOpen, setEnrolledOpen] = useState(true);

  const teachingLabs = labs.filter(lab => 
    lab.instructors.some(inst => inst.userEmail === userEmail)
  );

  const enrolledLabs = labs.filter(lab => 
    !lab.instructors.some(inst => inst.userEmail === userEmail)
  );

  const labID = pathname.split('/dashboard/lab/')[1]?.split('/')[0];

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Modern Sidebar */}
      <aside className="w-72 bg-slate-950 border-r border-slate-800 flex-shrink-0 fixed h-full overflow-y-auto z-30">
        <div className="py-6">
          {/* Primary Navigation */}
          <nav className="px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="my-6 border-t border-slate-800"></div>

          {/* Teaching Labs Section */}
          <div className="px-4">
            <button
              onClick={() => setTeachingOpen(!teachingOpen)}
              className="flex items-center gap-3 px-4 py-2.5 w-full text-sm font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/50 transition-all"
            >
              <FiBook size={18} />
              <span className="flex-1 text-left">Teaching</span>
              {teachingOpen ? (
                <FiChevronDown size={16} className="text-slate-500" />
              ) : (
                <FiChevronRight size={16} className="text-slate-500" />
              )}
            </button>
            {teachingOpen && (
              <div className="mt-2 space-y-1">
                {teachingLabs.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-500 italic">
                    No teaching labs yet
                  </div>
                ) : (
                  teachingLabs.map((lab) => (
                    <Link
                      key={lab?.id}
                      href={`/dashboard/lab/${lab?.id}`}
                      className={`px-3 py-2.5 flex gap-3 items-center rounded-lg transition-all ${
                        labID === lab?.id 
                          ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-xs ${
                        labID === lab?.id
                          ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {lab?.name[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{lab?.name}</h3>
                        <p className="text-xs text-slate-500 truncate">{lab?.section}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Enrolled Labs Section */}
          <div className="px-4 mt-4">
            <button
              onClick={() => setEnrolledOpen(!enrolledOpen)}
              className="flex items-center gap-3 px-4 py-2.5 w-full text-sm font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/50 transition-all"
            >
              <FiUsers size={18} />
              <span className="flex-1 text-left">Enrolled</span>
              {enrolledOpen ? (
                <FiChevronDown size={16} className="text-slate-500" />
              ) : (
                <FiChevronRight size={16} className="text-slate-500" />
              )}
            </button>
            {enrolledOpen && (
              <div className="mt-2 space-y-1">
                {enrolledLabs.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-500 italic">
                    No enrolled labs yet
                  </div>
                ) : (
                  enrolledLabs.map((lab) => (
                    <Link
                      key={lab?.id}
                      href={`/dashboard/lab/${lab?.id}`}
                      className={`px-3 py-2.5 flex gap-3 items-center rounded-lg transition-all ${
                        labID === lab?.id 
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-xs ${
                        labID === lab?.id
                          ? "bg-gradient-to-br from-blue-500 to-cyan-600 text-white"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {lab?.name[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{lab?.name}</h3>
                        <p className="text-xs text-slate-500 truncate">{lab?.section}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="my-6 border-t border-slate-800"></div>

          {/* Secondary Navigation */}
          <nav className="px-4 space-y-1">
            <Link
              href="/dashboard/archived"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 rounded-lg transition-all"
            >
              <FiArchive size={18} />
              <span>Archived Labs</span>
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 rounded-lg transition-all"
            >
              <FiSettings size={18} />
              <span>Settings</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-72">
        <div className="sticky top-0 z-40">
          {navbar}
        </div>
        <div className="overflow-auto">{children}</div>
      </div>
    </div>
  );
}