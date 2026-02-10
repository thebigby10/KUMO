// src/app/dashboard/layout.tsx

import React from "react";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "./DashboardLayoutClient";
import ClassroomActionWrapper from "./ClassroomActionWrapper";
import { LabController } from "@/controller/LabController";
import { LabType } from "@/types/labType";
import { getCurrentUser } from "@/actions/auth";
import UserMenu from "@/components/UserMenu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || !user.email) {
    redirect("/");
  }

  const labs: LabType[] = await LabController.getAllForUser(user.email);

  const navbar = (
    <nav className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center shadow-sm">
          <span className="text-white text-sm font-bold font-mono">K</span>
        </div>
        <span className="text-lg font-bold tracking-tight font-mono text-gray-900">
          KUMO
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <ClassroomActionWrapper userEmail={user.email} />
        <div className="w-px h-6 bg-gray-200" />
        <UserMenu email={user.email} name={user.name} />
      </div>
    </nav>
  );

  return (
    <DashboardLayoutClient navbar={navbar} labs={labs} userEmail={user.email}>
      {children}
    </DashboardLayoutClient>
  );
}