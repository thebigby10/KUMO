"use client";

import Link from "next/link";
import { FiUsers } from "react-icons/fi";
import LabActionMenu from "./LabActionMenu";
import { LabType } from "@/types/labType";

export default function LabCardActions({ lab, userEmail }: { lab: LabType; userEmail: string }) {
  return (
    <div
      className="px-5 py-3 flex justify-end items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <Link
        href={`/dashboard/lab/${lab.id}/people`}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        title="View people"
      >
        <FiUsers size={15} />
      </Link>

      {lab.instructors.some((inst: any) => inst.userEmail === userEmail) && (
        <LabActionMenu lab={lab} userEmail={userEmail} />
      )}
    </div>
  );
}