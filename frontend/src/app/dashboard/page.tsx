// src/app/dashboard/page.tsx

import { redirect } from "next/navigation";
import { LabController } from "@/controller/LabController";
import Link from "next/link";
import { getCurrentUser } from "@/actions/auth";
import LabCardActions from "@/components/LabCardActions";
import { FiCode, FiUsers, FiCalendar } from "react-icons/fi";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user || !user.email) {
    redirect("/");
  }

  const labs = await LabController.getAllForUser(user.email);

  return (
    <main className="p-8 min-h-screen bg-slate-900">
      {labs.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-32 text-center">
          <div className="w-72 h-56 bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-2xl mb-6 flex items-center justify-center">
            <div className="text-center space-y-3">
              <FiCode className="w-16 h-16 mx-auto text-slate-600" />
              <div className="text-slate-500 font-medium">No labs found</div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Welcome to Kumo
          </h3>
          <p className="text-slate-400 text-lg">Create or join a lab to get started</p>
        </div>
      ) : (
        <div className="max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Your Labs</h1>
            <p className="text-slate-400">Manage your coding labs and assignments</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {labs.map((lab: any) => {
              const owner = lab.instructors[0]?.user;
              const isMyClass = owner?.email === user.email;

              return (
                <div
                  key={lab.id}
                  className="group h-full"
                >
                  <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 flex flex-col h-80 hover:shadow-xl hover:shadow-blue-500/10">
                    {/* Header with gradient overlay */}
                    <div className="relative h-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-5">
                      {/* Pattern overlay */}
                      <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `
                          linear-gradient(to right, white 1px, transparent 1px),
                          linear-gradient(to bottom, white 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px'
                      }} />
                      
                      <div className="relative z-10 flex justify-between items-start h-full">
                        <div className="flex-1">
                          <Link 
                            href={`/dashboard/lab/${lab?.id}`} 
                            className="block group-hover:scale-[1.02] transition-transform"
                          >
                            <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
                              {lab.name}
                            </h3>
                            <p className="text-white/80 text-sm">
                              {lab.section}
                            </p>
                          </Link>
                        </div>
                      </div>

                      {/* Instructor Avatar (for enrolled classes) */}
                      {!isMyClass && owner && (
                        <div className="absolute -bottom-6 right-5">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 text-white flex items-center justify-center text-xl font-bold border-4 border-slate-800/50 shadow-lg">
                            {owner.name ? owner.name.charAt(0).toUpperCase() : "?"}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-5 flex-1 flex flex-col gap-4">
                      {/* Instructor name for enrolled classes */}
                      {!isMyClass && owner && (
                        <div className="flex items-center gap-2 text-sm">
                          <FiUsers className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-400">
                            {owner.name || owner.email}
                          </span>
                        </div>
                      )}

                      {/* Lab Info */}
                      <div className="space-y-2">
                        {lab.subject && (
                          <div className="flex items-center gap-2 text-sm">
                            <FiCode className="w-4 h-4 text-blue-400" />
                            <span className="text-slate-300">{lab.subject}</span>
                          </div>
                        )}
                        {lab.room && (
                          <div className="flex items-center gap-2 text-sm">
                            <FiCalendar className="w-4 h-4 text-indigo-400" />
                            <span className="text-slate-300">Room {lab.room}</span>
                          </div>
                        )}
                        {!lab.subject && !lab.room && (
                          <div className="text-sm text-slate-500 italic">
                            No additional details
                          </div>
                        )}
                      </div>

                      {/* Role Badge */}
                      <div className="mt-auto">
                        {isMyClass ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            <span className="text-xs font-medium text-green-400">Teaching</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            <span className="text-xs font-medium text-blue-400">Enrolled</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="border-t border-slate-700/50">
                      <LabCardActions lab={lab} userEmail={user.email} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}