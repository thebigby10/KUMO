import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Settings } from "lucide-react";
import { getCurrentUser } from "@/actions/auth";

export default async function LabLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ labId: string }>;
}) {
  const { labId } = await params;
  const user = await getCurrentUser();

  // Validate Lab Exists
  const lab = await prisma.lab.findUnique({
    where: { id: labId },
  });

  if (!lab) notFound();

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Class Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-3 border-b bg-white sticky top-0 z-50">
        
        {/* Left: Hamburger & Title */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            ☰
          </Link>
          <div className="flex flex-col">
             <h1 className="text-lg font-medium text-gray-800 hover:underline cursor-pointer">
               {lab.name}
             </h1>
             {lab.section && <span className="text-xs text-gray-500">{lab.section}</span>}
          </div>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 flex h-full">
           <Link href={`/dashboard/lab/${labId}`} className="px-6 py-3 text-sm font-medium text-gray-900 border-b-4 border-blue-600 hover:bg-gray-50">
             Stream
           </Link>
           <Link href={`/dashboard/lab/${labId}/work`} className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
             Classwork
           </Link>
           <Link href={`/dashboard/lab/${labId}/people`} className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
             People
           </Link>
        </div>

        {/* Right: Settings & Profile */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Settings size={24} />
          </button>
          <div className="w-9 h-9 bg-purple-700 rounded-full flex items-center justify-center text-white font-medium">
             {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </nav>

      {/* 2. Page Content */}
      <div className="max-w-[1000px] mx-auto p-6">
        {children}
      </div>
    </div>
  );
}