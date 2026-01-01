"use client";

import { X } from "lucide-react";
import { joinLab } from "../actions/classroom-actions/lab";
import { useState } from "react";

interface JoinLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export default function JoinLabModal({ isOpen, onClose, userEmail }: JoinLabModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const result = await joinLab(formData, userEmail);
    
    setLoading(false);
    
    if (result?.error) {
      setError(result.error);
    } else {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-800">Join class</h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:bg-gray-100 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form action={handleSubmit}>
          <div className="p-6 space-y-6">
            {error && (
               <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100 flex items-center gap-2">
                 <span>⚠️</span> {error}
               </div>
            )}

            <div className="border border-gray-300 rounded p-4">
              <p className="text-sm text-gray-500 mb-1">You are currently signed in as</p>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {userEmail.charAt(0).toUpperCase()}
                 </div>
                 <div className="font-medium text-gray-900 text-sm">{userEmail}</div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">Class code</h3>
              <p className="text-sm text-gray-500 mb-4">Ask your teacher for the class code, then enter it here.</p>
              
              <input
                name="labCode"
                required
                type="text"
                placeholder="Class code"
                className="w-full sm:w-1/2 px-4 py-3 text-gray-900 placeholder-gray-400 border border-gray-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Joining..." : "Join"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}