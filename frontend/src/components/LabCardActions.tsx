"use client";

import Link from "next/link";
import { FiUsers, FiMoreVertical } from "react-icons/fi";
import LabActionMenu from "./LabActionMenu";
import { LabType } from "@/types/labType";

export default function LabCardActions({ lab, userEmail }: { lab: LabType; userEmail: string }) {
  return (
    <div
      className="p-4 flex justify-end items-center gap-2"
      onClick={(e) => e.stopPropagation()} 
    >
      <Link
        href={`/dashboard/lab/${lab.id}/people`}
        className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
        title="View people"
      >
        <FiUsers size={18} />
      </Link>

      {lab.instructors.some((inst: any) => inst.userEmail === userEmail) && (
        <LabActionMenu lab={lab} userEmail={userEmail} />
      )}
    </div>
  );
}