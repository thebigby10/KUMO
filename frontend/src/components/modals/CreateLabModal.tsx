"use client";

import { X } from "lucide-react";
import { createLab } from "../../actions/classroom-actions/lab";
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
    
    const result = await createLab(formData, userEmail);
    
    setLoading(false);
    
    if (result?.error) {
      setError(result.error);
    } else {
      onClose();
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="w-full max-w-lg overflow-hidden bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
            <div>
              <h2 className="text-xl font-bold text-white">Create New Lab</h2>
              <p className="text-sm text-slate-400 mt-1">Set up a new coding lab for your students</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form action={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Lab Name <span className="text-red-400">*</span>
              </label>
              <input
                name="name"
                required
                type="text"
                placeholder="e.g., Introduction to Python"
                className="w-full px-4 py-3 text-white placeholder-slate-500 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Section
              </label>
              <input
                name="section"
                type="text"
                placeholder="e.g., Section A, Fall 2024"
                className="w-full px-4 py-3 text-white placeholder-slate-500 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Subject
              </label>
              <input
                name="subject"
                type="text"
                placeholder="e.g., Computer Science"
                className="w-full px-4 py-3 text-white placeholder-slate-500 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Room
              </label>
              <input
                name="room"
                type="text"
                placeholder="e.g., Lab 101"
                className="w-full px-4 py-3 text-white placeholder-slate-500 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </span>
                ) : "Create Lab"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}