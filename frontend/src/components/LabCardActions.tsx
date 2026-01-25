"use client";

import Link from "next/link";
import { FaRegUser } from "react-icons/fa";
import LabActionMenu from "./LabActionMenu";
import { LabType } from "@/types/labType";

export default function LabCardActions({ lab, userEmail }: { lab: LabType; userEmail: string }) {
  return (
    <div
      className="border-t p-3 flex justify-end gap-2 border-gray-100 bg-white text-black"
      onClick={(e) => e.stopPropagation()} 
    >
      <Link
        href={`/dashboard/lab/${lab.id}/people`}
        className="p-2 rounded-full hover:bg-gray-200"
      >
        <FaRegUser />
      </Link>

      {lab.instructors.some((inst: any) => inst.userEmail === userEmail) && (
        <LabActionMenu lab={lab} userEmail={userEmail} />
      )}
    </div>
  );
}
