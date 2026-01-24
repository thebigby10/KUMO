// src/app/dashboard/layout.tsx

import React from "react";
import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "./DashboardLayoutClient";
import ClassroomActionWrapper from "./ClassroomActionWrapper";
import UserMenu from "../components/UserMenu";
import { LabController } from "@/controller/LabController";
import { LabType } from "@/types/labType";

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
    <nav className="flex items-center justify-between px-6 py-3 border-b bg-white sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-green-600 rounded flex items-center justify-center text-white">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
          </svg>
        </div>
        <span className="text-xl font-normal text-gray-700 ml-2">
          Classroom
        </span>
      </div>

      <div className="flex items-center gap-4">
        <ClassroomActionWrapper userEmail={user.email} />
        <div className="pl-2">
          <UserMenu email={user.email} name={user.name} />
        </div>
      </div>
    </nav>
  );

  return (
    <DashboardLayoutClient navbar={navbar} labs={labs} userEmail={user.email}>{children}</DashboardLayoutClient>
  );
}
