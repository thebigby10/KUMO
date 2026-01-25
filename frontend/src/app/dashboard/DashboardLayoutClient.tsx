"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  Users,
  GraduationCap,
  Archive,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { LabType } from "@/types/labType";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/dashboard/calendar", icon: Calendar, label: "Calendar" },
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 fixed h-full overflow-y-auto z-20">
        <div className="py-2">
          <nav className="px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3 rounded-full text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="my-2 border-t border-gray-200"></div>

          <div className="px-2">
            <button
              onClick={() => setTeachingOpen(!teachingOpen)}
              className="flex items-center gap-2 px-4 py-2 w-full text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition"
            >
              <GraduationCap size={20} />
              <span className="flex-1 text-left">Teaching</span>
              {teachingOpen ? (
                <ChevronDown size={16} className="text-gray-500" />
              ) : (
                <ChevronRight size={16} className="text-gray-500" />
              )}
            </button>
            {teachingOpen && (
              <div className="ml-1 mt-1 space-y-1">
                {teachingLabs.map((lab) => (
                  <Link
                    key={lab?.id}
                    href={`/dashboard/lab/${lab?.id}`}
                    className={`px-4 py-2 flex gap-4 items-center text-gray-600 hover:bg-gray-100 rounded-full transition ${ labID === lab?.id ? "bg-blue-100 text-blue-700" : "" }`}
                  >
                    <div className="w-8 h-8 p-2 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium">
                      {lab?.name[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <h1 className="font-semibold text-sm">{lab?.name}</h1>
                      <p className="text-sm">{lab?.section}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="px-2 mt-2">
            <button
              onClick={() => setEnrolledOpen(!enrolledOpen)}
              className="flex items-center gap-4 px-4 py-2 w-full text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition"
            >
              <Users size={20} />
              <span className="flex-1 text-left">Enrolled</span>
              {enrolledOpen ? (
                <ChevronDown size={16} className="text-gray-500" />
              ) : (
                <ChevronRight size={16} className="text-gray-500" />
              )}
            </button>
            {enrolledOpen && (
              <div className="ml-1 mt-1 space-y-1">
                {enrolledLabs.map((lab) => (
                  <Link
                    key={lab?.id}
                    href={`/dashboard/lab/${lab?.id}`}
                    className={`px-4 py-2 flex gap-4 items-center text-gray-600 hover:bg-gray-100 rounded-full transition ${ labID === lab?.id ? "bg-blue-100 text-blue-700" : "" }`}
                  >
                    <div className="w-8 h-8 p-2 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium">
                      {lab?.name[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <h1 className="font-semibold text-sm">{lab?.name}</h1>
                      <p className="text-sm">{lab?.section}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="my-2 border-t border-gray-200"></div>

          <nav className="px-2 space-y-1">
            <Link
              href="/dashboard/archived"
              className="flex items-center gap-4 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition"
            >
              <Archive size={20} />
              <span>Archived classes</span>
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-4 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition"
            >
              <Settings size={20} />
              <span>Settings</span>
            </Link>
          </nav>
        </div>
      </aside>

      <div className="flex-1 ml-64">
        {navbar}
        <div className="overflow-auto">{children}</div>
      </div>
    </div>
  );
}
