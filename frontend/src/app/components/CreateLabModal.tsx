"use client";

import { X } from "lucide-react";
import { createLab } from "../actions/classroom-actions/lab";
import { useState } from "react";

interface CreateLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string; 
}

export default function CreateLabModal({ isOpen, onClose, userEmail }: CreateLabModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    
    // We bind the userEmail to the action since the form doesn't contain it
    const result = await createLab(formData, userEmail);
    
    setLoading(false);
    
    if (result?.error) {
      setError(result.error);
    } else {
      onClose(); // Close modal on success
      // The page will automatically refresh due to revalidatePath in your action
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden bg-white rounded-lg shadow-xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-800">Create class</h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:bg-gray-100 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form action={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div>
            <input
              name="name"
              required
              type="text"
              placeholder="Class name (required)"
              className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-100 border-b-2 border-transparent rounded-t-md focus:border-blue-600 focus:bg-gray-50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <input
              name="section"
              type="text"
              placeholder="Section"
              className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-100 border-b-2 border-transparent rounded-t-md focus:border-blue-600 focus:bg-gray-50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <input
              name="subject"
              type="text"
              placeholder="Subject"
              className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-100 border-b-2 border-transparent rounded-t-md focus:border-blue-600 focus:bg-gray-50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <input
              name="room"
              type="text"
              placeholder="Room"
              className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-100 border-b-2 border-transparent rounded-t-md focus:border-blue-600 focus:bg-gray-50 focus:outline-none transition-colors"
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
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}