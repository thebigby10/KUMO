"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { LabType } from "@/types/labType";
import { updateLab } from "@/actions/classroom-actions/lab";

interface CreateLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  lab: LabType;
}

export default function EditLabModal({
  isOpen,
  onClose,
  userEmail,
  lab,
}: CreateLabModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(lab.name);
  const [section, setSection] = useState(lab.section);
  const [subject, setSubject] = useState(lab.subject);
  const [room, setRoom] = useState(lab.room);

  if (!isOpen) return null;

  async function handleSubmit() {
    setLoading(true);
    setError("");

    await updateLab(lab.id, userEmail, {
      name,
      section,
      subject,
      room,
    });

    setLoading(false);
  }

  return (
    <>
      {/* Backdrop - Separate element with z-50 */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Content - Also z-50 to appear above backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-lg overflow-hidden bg-white rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-medium text-gray-800">Edit Lab</h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name">Lab Name</label>
              <input
                name="name"
                required
                type="text"
                className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-100 border-b-2 border-transparent rounded-t-md focus:border-blue-600 focus:bg-gray-50 focus:outline-none transition-colors"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="section">Section</label>
              <input
                name="section"
                type="text"
                placeholder="Section"
                className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-100 border-b-2 border-transparent rounded-t-md focus:border-blue-600 focus:bg-gray-50 focus:outline-none transition-colors"
                value={section}
                onChange={(e) => setSection(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="subject">Subject</label>
              <input
                name="subject"
                type="text"
                placeholder="Subject"
                className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-100 border-b-2 border-transparent rounded-t-md focus:border-blue-600 focus:bg-gray-50 focus:outline-none transition-colors"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="room">Room</label>
              <input
                name="room"
                type="text"
                placeholder="Room"
                className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-100 border-b-2 border-transparent rounded-t-md focus:border-blue-600 focus:bg-gray-50 focus:outline-none transition-colors"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 mt-8 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
