import { notFound } from "next/navigation";
import prisma from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/actions/auth";
import { MoreVertical, Copy } from "lucide-react";
import AnnouncementInput from "@/app/components/stream/AnnouncementInput";

export default async function LabStreamPage({
  params,
}: {
  params: Promise<{ labId: string }>;
}) {
  const { labId } = await params;
  const user = await getCurrentUser();

  if (!user?.email) return null;

  // 1. Fetch Lab AND Announcements (Newest First)
  const lab = await prisma.lab.findUnique({
    where: { id: labId },
    include: {
      instructors: true,
      announcements: {
        orderBy: { createdAt: 'desc' },
        include: {
          user: true // Get the author's details (name, email)
        }
      }
    }
  });

  if (!lab) notFound();

  // 2. Check Permissions
  const isInstructor = lab.instructors.some(inst => inst.userEmail === user.email);

  return (
    <div className="space-y-6">
      
      {/* A. Hero Banner (Same as before) */}
      <div className="relative h-60 rounded-xl overflow-hidden bg-blue-600 bg-[url('https://gstatic.com/classroom/themes/img_read.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
          <h1 className="text-4xl font-bold">{lab.name}</h1>
          <p className="text-xl mt-2 font-medium">{lab.section}</p>
          {lab.subject && <p className="text-sm mt-1 opacity-90 font-medium">{lab.subject}</p>}
        </div>
      </div>

      {/* B. Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[196px_1fr] gap-6">
        
        {/* LEFT COLUMN: Class Code / Upcoming */}
        <div className="space-y-4 hidden md:block">
          {isInstructor ? (
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Class code</span>
                <button className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                   <MoreVertical size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-medium text-blue-600 tracking-wider">
                  {lab.labCode}
                </span>
                <button className="p-2 hover:bg-gray-100 rounded text-gray-500">
                  <Copy size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-4">Upcoming</h3>
              <p className="text-xs text-gray-500 mb-4">No work due soon</p>
              <button className="text-right w-full text-xs font-medium text-blue-600 hover:underline">View all</button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Stream Feed */}
        <div className="space-y-4">
          
          {/* 1. Input Box */}
          <AnnouncementInput 
            labId={lab.id} 
            userEmail={user.email} 
            userAvatarChar={user.email.charAt(0).toUpperCase()} 
          />

          {/* 2. Announcement Feed */}
          {lab.announcements.length === 0 ? (
            // EMPTY STATE
            <div className="bg-white border rounded-lg p-8 shadow-sm flex flex-col items-center justify-center text-center">
               <div className="w-40 h-32 bg-gray-100 mb-4 rounded flex items-center justify-center text-gray-400">
                 <span className="text-4xl">💬</span>
               </div>
               <p className="text-sm text-gray-800 font-medium">This is where you can talk to your class</p>
               <p className="text-xs text-gray-500 mt-1">Use the stream to share announcements, post assignments, and respond to student questions</p>
            </div>
          ) : (
            // POSTS LIST
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {lab.announcements.map((post) => (
                <div key={post.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {post.user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">
                          {post.user.name || post.user.email}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:bg-gray-100 p-2 rounded-full">
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="text-sm text-gray-800 whitespace-pre-wrap pl-[52px]">
                    {post.content}
                  </div>
                  
                  {/* Optional: Footer for comments (future feature) */}
                  <div className="mt-3 pt-3 border-t border-gray-100 pl-[52px]">
                     <input 
                        type="text" 
                        placeholder="Add class comment..." 
                        className="w-full text-xs p-2 rounded-full border border-gray-200 focus:border-gray-400 outline-none transition"
                     />
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}