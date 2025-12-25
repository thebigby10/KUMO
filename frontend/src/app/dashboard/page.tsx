import { Plus } from "lucide-react";
import prisma from "../lib/prisma";
import CreateLabModalWrapper from "./CreateLabModalWrapper";
import { getCurrentUser } from "../actions/auth";
import { redirect } from "next/navigation";
import { logoutAction } from "../actions/auth";


export default async function DashboardPage() {
  const user = await getCurrentUser();


  if (!user || !user.email)
  {
    redirect("/");
  }
  
  const labs = await prisma.lab.findMany({
    where: {
      instructors: {
        some: {
          userEmail: user.email
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-3 border-b bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-medium text-gray-600 cursor-pointer">☰</div>
          <span className="text-xl font-medium text-gray-600 ml-4">Kumo Classroom</span>
        </div>
        
        <div className="flex items-center gap-4">
          <CreateLabModalWrapper userEmail={user.email} />
          
          {/* User Profile / Logout */}
          <div className="flex items-center gap-3 pl-4 border-l">
            <div className="text-sm text-right hidden sm:block">
              <div className="font-medium text-gray-900">{user.email}</div>
            </div>
            {/* Simple Logout Button form */}
            <form action={logoutAction}>
              <button title="Logout" className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium hover:bg-purple-700 transition">
                {user.email.charAt(0).toUpperCase()}
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Main Grid Content */}
      <main className="p-6">
        {labs.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-center animate-in fade-in duration-500">
            <div className="w-64 h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-400">
              No classes yet
            </div>
            <h3 className="text-lg font-medium text-gray-900">It's quiet here...</h3>
            <p className="text-gray-500">Create a class to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {labs.map((lab) => (
              <div key={lab.id} className="group border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer bg-white flex flex-col h-72">
                <div className="h-24 bg-blue-600 p-4 text-white relative bg-[url('https://gstatic.com/classroom/themes/img_read.jpg')] bg-cover">
                  <h2 className="text-xl font-medium hover:underline truncate">{lab.name}</h2>
                  <p className="text-sm opacity-90 truncate">{lab.section}</p>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="text-sm text-gray-500">
                    {lab.subject && <p className="truncate">{lab.subject}</p>}
                  </div>
                </div>
                <div className="border-t p-3 flex justify-end gap-2">
                   {/* Icon placeholders */}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}