"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { LabType } from "@/types/labType";
import { updateLab } from "@/actions/classroom-actions/lab";

import LabBannerPicker from "../LabBannerPicker";

interface EditLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  lab: LabType;
}

const inputClass =
  "w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg " +
  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400/40 focus:border-pink-400 " +
  "hover:border-gray-300 transition-all";

export default function EditLabModal({ isOpen, onClose, userEmail, lab }: EditLabModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(lab.name);
  const [section, setSection] = useState(lab.section || "");
  const [subject, setSubject] = useState(lab.subject || "");
  const [room, setRoom] = useState(lab.room || "");
  const [banner, setBanner] = useState(lab.banner || "bg-gradient-to-br from-pink-400 via-rose-400 to-pink-600");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {

      await updateLab(lab.id, userEmail, { name, section, subject, room });
      onClose();
    } catch {
      setError("Failed to update lab. Please try again.");
    }
    setLoading(false);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 animate-fade-in-fast"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-xl animate-scale-in pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Edit Lab</h2>
              <p className="text-sm text-gray-400 mt-0.5">Update lab information</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Lab Name <span className="text-red-400">*</span>
              </label>
              <input
                name="name"
                required
                type="text"
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Section</label>
                <input
                  name="section"
                  type="text"
                  placeholder="e.g., Section A"
                  className={inputClass}
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <input
                  name="subject"
                  type="text"
                  placeholder="e.g., Computer Science"
                  className={inputClass}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Room</label>
              <input
                name="room"
                type="text"
                placeholder="e.g., Lab 101"
                className={inputClass}
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              />
            </div>

            <LabBannerPicker value={banner} onChange={setBanner} />

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}