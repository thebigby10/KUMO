import { redirect } from "next/navigation";
import prisma from "../lib/prisma";
import { getCurrentUser, logoutAction } from "../actions/auth";
import ClassroomActionWrapper from "./ClassroomActionWrapper";

export default async function DashboardPage() {
  
  const user = await getCurrentUser();

  if (!user || !user.email) {
    redirect("/");
  }

  // 2. Fetch labs where user is Instructor OR Student
  const labs = await prisma.lab.findMany({
    where: {
      OR: [
        { instructors: { some: { userEmail: user.email } } },
        { enrollments: { some: { userEmail: user.email } } }
      ]
    },
    include: {
      instructors: {
        where: { role: "OWNER" },
        include: { user: true } 
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-3 border-b bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600">
             <div className="text-xl">☰</div>
          </button>
          <span className="text-xl font-medium text-gray-600 ml-2">Kumo Classroom</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* This wrapper will now hold both Create & Join logic */}
          <ClassroomActionWrapper userEmail={user.email} />
          
          {/* User Profile / Logout */}
          <div className="flex items-center gap-3 pl-4">
             <form action={logoutAction}>
              <button title={`Logout ${user.email}`} className="w-9 h-9 bg-purple-700 rounded-full flex items-center justify-center text-white font-medium hover:bg-purple-800 transition shadow-sm">
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
              No classes found
            </div>
            <h3 className="text-lg font-medium text-gray-900">It's quiet here...</h3>
            <p className="text-gray-500">Create or join a class to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {labs.map((lab:any) => {
              // Find the owner's name to display
              const owner = lab.instructors[0]?.user;
              const isMyClass = owner?.email === user.email;

              return (
                <div key={lab.id} className="group border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer bg-white flex flex-col h-72">
                  {/* Banner */}
                  <div className="h-28 bg-blue-600 p-4 text-white relative bg-[url('https://gstatic.com/classroom/themes/img_read.jpg')] bg-cover">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-medium hover:underline truncate w-10/12">{lab.name}</h2>
                      <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded-full transition">
                        ⋮
                      </button>
                    </div>
                    <p className="text-sm opacity-90 truncate mt-1">{lab.section}</p>
                    
                    {/* Show Teacher Name if I am a student */}
                    {!isMyClass && owner && (
                       <p className="text-xs absolute bottom-3 left-4 opacity-90 font-medium">
                         {owner.name || owner.email}
                       </p>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <div className="text-xs text-gray-500 font-medium">
                        {lab.subject ? lab.subject : "No Subject"}
                        {lab.room ? ` • Room ${lab.room}` : ""}
                    </div>
                  </div>

                  {/* Footer Icons */}
                  <div className="border-t p-3 flex justify-end gap-1 border-gray-100 bg-gray-50/50">
                    <button className="p-2 hover:bg-gray-200 rounded-full text-gray-600 transition" title="Open Gradebook">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded-full text-gray-600 transition" title="Open Folder">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}