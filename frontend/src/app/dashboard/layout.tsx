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

  const labs : LabType[] = await LabController.getAllForUser(user.email);

  const navbar = (
    <nav className="flex items-center justify-between px-8 py-4 bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="text-lg font-bold font-mono text-white">K</span>
        </div>
        <span className="text-xl font-bold tracking-tight font-mono text-white">
          KUMO
        </span>
      </div>

      <div className="flex items-center gap-4">
        <ClassroomActionWrapper userEmail={user.email} />
        <div className="pl-2 border-l border-slate-700">
          <UserMenu email={user.email} name={user.name} />
        </div>
      </div>
    </nav>
  );

  return (
    <DashboardLayoutClient navbar={navbar} labs={labs} userEmail={user.email}>{children}</DashboardLayoutClient>
  );
}