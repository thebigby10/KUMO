import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/actions/auth";
import { MoreVertical, Copy } from "lucide-react";

export default async function LabStreamPage({
  params,
}: {
  params: Promise<{ labId: string }>;
}) {
  const { labId } = await params;
  const user = await getCurrentUser();

  if (!user?.email) return null;

  // 1. Fetch Lab with Instructors to check permission
  const lab = await prisma.lab.findUnique({
    where: { id: labId },
    include: {
      instructors: true
    }
  });

  if (!lab) notFound();

  // 2. Check if current user is an instructor (Owner/Assistant)
  const isInstructor = lab.instructors.some(inst => inst.userEmail === user.email);

  return (
    <div className="space-y-6">
      
      {/* A. Hero Banner */}
      <div className="relative h-60 rounded-xl overflow-hidden bg-blue-600 bg-[url('https://gstatic.com/classroom/themes/img_read.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
          <h1 className="text-4xl font-bold">{lab.name}</h1>
          <p className="text-xl mt-2 font-medium">{lab.section}</p>
          {lab.subject && <p className="text-sm mt-1 opacity-90 font-medium">{lab.subject}</p>}
        </div>
        <button className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition">
          <div className="p-1 bg-black/20 rounded-full">
             <span className="text-xs font-medium px-2">Customize</span>
          </div>
        </button>
      </div>

      {/* B. Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[196px_1fr] gap-6">
        
        {/* LEFT COLUMN */}
        <div className="space-y-4 hidden md:block">
          
          {/* 1. Class Code Box (Instructors Only) */}
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
                <button 
                  className="p-2 hover:bg-gray-100 rounded text-gray-500"
                  title="Copy class code"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>
          ) : (
             // Students see "Upcoming work" instead of code
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-4">Upcoming</h3>
              <p className="text-xs text-gray-500 mb-4">No work due soon</p>
              <button className="text-right w-full text-xs font-medium text-blue-600 hover:underline">
                View all
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (Announcements) */}
        <div className="space-y-4">
          
          {/* Announcement Input */}
          <div className="bg-white border rounded-lg p-4 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition shadow-sm hover:shadow-md">
            <div className="w-10 h-10 bg-purple-700 rounded-full flex items-center justify-center text-white font-bold shrink-0">
               {user.email.charAt(0).toUpperCase()}
            </div>
            <p className="text-gray-500 text-sm truncate">
              Announce something to your class...
            </p>
          </div>

          {/* Existing Announcements (Placeholder) */}
          <div className="bg-white border rounded-lg p-8 shadow-sm flex flex-col items-center justify-center text-center">
             <div className="w-40 h-32 bg-gray-100 mb-4 rounded flex items-center justify-center text-gray-400">
               {/* Illustration Placeholder */}
               <span className="text-4xl">💬</span>
             </div>
             <p className="text-sm text-gray-800 font-medium">This is where you can talk to your class</p>
             <p className="text-xs text-gray-500 mt-1">Use the stream to share announcements, post assignments, and respond to student questions</p>
          </div>

        </div>
      </div>
    </div>
  );
}