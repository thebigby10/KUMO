// src/components/stream/AnnouncementInput.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { FiSend, FiPaperclip } from "react-icons/fi";
import { createAnnouncement } from "@/actions/stream";

interface AnnouncementInputProps {
  labId: string;
  userEmail: string;
  userAvatarChar: string;
}

export default function AnnouncementInput({ labId, userEmail, userAvatarChar }: AnnouncementInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Only collapse if empty to prevent losing data
        if (content.trim() === "") {
          setIsExpanded(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [content]);

  async function handlePost() {
    if (!content.trim()) return;
    
    setIsPosting(true);
    const formData = new FormData();
    formData.append("content", content);

    const result = await createAnnouncement(formData, labId, userEmail);
    
    setIsPosting(false);
    if (result?.success) {
      setContent("");
      setIsExpanded(false);
    } else {
      alert(result?.error || "Failed to post");
    }
  }

  if (isExpanded) {
    return (
      <div ref={containerRef} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-xl p-5">
        <div className="flex gap-4">
           <div className="flex-1">
             <textarea
               value={content}
               onChange={(e) => setContent(e.target.value)}
               placeholder="Announce something to your class..."
               className="w-full h-36 p-4 bg-slate-900 border border-slate-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none transition-all text-white placeholder-slate-500"
               autoFocus
             />
           </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700">
          <button className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <FiPaperclip size={20} />
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setIsExpanded(false)}
              className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handlePost}
              disabled={!content.trim() || isPosting}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isPosting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Posting...
                </>
              ) : (
                <>
                  <FiSend size={16} />
                  Post
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Collapsed State
  return (
    <div 
      onClick={() => setIsExpanded(true)}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:border-slate-600 hover:bg-slate-800/70 transition-all shadow-lg"
    >
      <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-lg">
         {userAvatarChar}
      </div>
      <p className="text-slate-400 text-sm flex-1">
        Announce something to your class...
      </p>
    </div>
  );
}