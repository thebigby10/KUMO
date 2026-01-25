"use client";

import { useState, useRef, useEffect } from "react";
import { FaEllipsisVertical } from "react-icons/fa6";
import { LabType } from "@/types/labType";
import { deleteLab } from "@/actions/classroom-actions/lab";
import EditLabModal from "./modals/EditLabModal";

export default function LabActionMenu({
  lab,
  userEmail,
}: {
  lab: LabType;
  userEmail: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [isOpenEditModal, setIsOpenEditModal] = useState(false);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDeleteLab = async (labId: string, userEmail: string) => {
    await deleteLab(labId, userEmail);
  };

  return (
    <>
      <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          <FaEllipsisVertical />
        </button>

        {open && (
          <div className="absolute right-0 bottom-10 w-36 bg-white border border-gray-100 rounded-md shadow-lg z-50">
            <div
              onClick={() => {
                console.log("Open edit lab modal");
                setIsOpenEditModal(true);
              }}
              className="block px-4 py-2 text-sm hover:bg-gray-100"
            >
              Edit
            </div>

            <button
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              onClick={() => {
                setOpen(false);
                // hook delete modal / action here
                handleDeleteLab(lab.id, userEmail);
              }}
            >
              Delete
            </button>

            <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
              Archive
            </button>
          </div>
        )}
      </div>

      {
        isOpenEditModal && (
          <EditLabModal isOpen={isOpenEditModal} onClose={() => setIsOpenEditModal(false)} lab={lab} userEmail={userEmail}/>
        )
      }
    </>
  );
}
