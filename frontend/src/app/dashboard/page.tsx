import { Plus } from "lucide-react";
import prisma from "../lib/prisma";
import CreateLabModalWrapper from "./CreateLabModalWrapper";


// This is a Server Component (fetches data directly)
export default async function DashboardPage() {
  // TODO: Replace this with the real logged-in user from your Auth Session/Cookie
  // For now, we hardcode it to test the flow
  const userEmail = "kumo_tester@example.com";

  // Fetch labs where the user is either enrolled OR an instructor
  // (We use a simple query for now to just show all labs created by this user)
  const labs = await prisma.lab.findMany({
    where: {
      instructors: {
        some: {
          userEmail: userEmail
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navbar (Google Classroom Style) */}
      <nav className="flex items-center justify-between px-6 py-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-medium text-gray-600">☰</div>
          <span className="text-xl font-medium text-gray-600 ml-4">Kumo Classroom</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* The "+" Button wrapped in a client component to handle state */}
          <CreateLabModalWrapper userEmail={userEmail} />
          
          {/* User Avatar Placeholder */}
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium">
            K
          </div>
        </div>
      </nav>

      {/* Main Grid Content */}
      <main className="p-6">
        {labs.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <div className="w-64 h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400">
              No classes yet
            </div>
            <p className="text-gray-600">Create or join a class to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {labs.map((lab:any) => (
              <div key={lab.id} className="group border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer bg-white flex flex-col h-72">
                {/* Banner */}
                <div className="h-24 bg-blue-600 p-4 text-white relative bg-[url('https://gstatic.com/classroom/themes/img_read.jpg')] bg-cover">
                  <h2 className="text-xl font-medium hover:underline truncate">{lab.name}</h2>
                  <p className="text-sm opacity-90 truncate">{lab.section}</p>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                    ⋮
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="text-sm text-gray-500">
                    {lab.subject && <p className="truncate">{lab.subject}</p>}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t p-3 flex justify-end gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}