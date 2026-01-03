"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, Paperclip } from "lucide-react";
import { createAnnouncement } from "@/app/actions/stream";

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
      <div ref={containerRef} className="bg-white border rounded-lg shadow-md p-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex gap-4">
           {/* Not showing avatar in expanded mode to save space, purely aesthetic choice */}
           <div className="flex-1">
             <textarea
               value={content}
               onChange={(e) => setContent(e.target.value)}
               placeholder="Announce something to your class"
               className="w-full h-32 p-3 bg-gray-50 border-b-2 border-blue-500 focus:bg-gray-100 outline-none resize-none transition-colors text-gray-800"
               autoFocus
             />
           </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-2">
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
            <Paperclip size={20} />
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setIsExpanded(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded transition"
            >
              Cancel
            </button>
            <button 
              onClick={handlePost}
              disabled={!content.trim() || isPosting}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {isPosting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Collapsed State (What you see initially)
  return (
    <div 
      onClick={() => setIsExpanded(true)}
      className="bg-white border rounded-lg p-4 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition shadow-sm hover:shadow-md"
    >
      <div className="w-10 h-10 bg-purple-700 rounded-full flex items-center justify-center text-white font-bold shrink-0">
         {userAvatarChar}
      </div>
      <p className="text-gray-500 text-sm truncate hover:text-gray-600">
        Announce something to your class...
      </p>
    </div>
  );
}