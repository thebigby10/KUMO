// src/app/dashboard/page.tsx

import { redirect } from "next/navigation";
import { LabController } from "@/controller/LabController";
import Link from "next/link";
import { getCurrentUser } from "@/actions/auth";
import LabCardActions from "@/components/LabCardActions";
import { FiCode, FiUsers, FiMapPin, FiBookOpen, FiPlus } from "react-icons/fi";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user || !user.email) {
    redirect("/");
  }

  const labs = await LabController.getAllForUser(user.email);

  if (labs.length === 0) {
    return (
      <main className="min-h-full bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="max-w-sm w-full text-center">
          {/* Empty state illustration */}
          <div className="w-24 h-24 bg-pink-50 border-2 border-dashed border-pink-200 rounded-3xl mx-auto mb-6 flex items-center justify-center">
            <FiBookOpen className="w-10 h-10 text-pink-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to KUMO
          </h2>
          <p className="text-gray-500 mb-6 leading-relaxed">
            Get started by creating your first lab or joining an existing one with a code from your instructor.
          </p>
          <div className="flex flex-col gap-2 items-center">
            <div className="text-xs text-gray-400 flex items-center gap-1.5">
              <FiPlus className="w-3.5 h-3.5" />
              Use the buttons in the top bar to create or join a lab
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-8 min-h-full bg-gray-50">
      <div className="max-w-7xl">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Labs</h1>
          <p className="text-gray-500 text-sm">
            {labs.length} lab{labs.length !== 1 ? "s" : ""} · Manage your coding labs and assignments
          </p>
        </div>

        {/* Lab Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {labs.map((lab: any) => {
            const owner = lab.instructors[0]?.user;
            const isMyClass = owner?.email === user.email;

            return (
              <div key={lab.id} className="group">
                <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-pink-200 transition-all duration-200 flex flex-col h-72 hover:-translate-y-0.5">
                  {/* Card Header */}
                  <div className="relative h-28 overflow-hidden">
                    {/* Gradient or Image background */}
                    {lab.banner?.startsWith("http") ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${lab.banner})` }}
                      >
                         <div className="absolute inset-0 bg-black/20" /> {/* Slight overlay for text readability */}
                      </div>
                    ) : lab.banner ? (
                      <div className={`absolute inset-0 ${lab.banner}`} />
                    ) : (
                      <div
                        className={`absolute inset-0 ${
                          isMyClass
                            ? "bg-gradient-to-br from-pink-400 via-rose-400 to-pink-600"
                            : "bg-gradient-to-br from-blue-400 via-indigo-400 to-blue-600"
                        }`}
                      />
                    )}
                    {/* Subtle grid */}
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `
                          linear-gradient(to right, white 1px, transparent 1px),
                          linear-gradient(to bottom, white 1px, transparent 1px)
                        `,
                        backgroundSize: "20px 20px",
                      }}
                    />

                    <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                      <Link href={`/dashboard/lab/${lab?.id}`}>
                        <h3 className="text-white font-bold text-base line-clamp-2 group-hover:underline">
                          {lab.name}
                        </h3>
                        {lab.section && (
                          <p className="text-white/80 text-xs mt-0.5">{lab.section}</p>
                        )}
                      </Link>
                    </div>

                    {/* Instructor avatar (enrolled labs) */}
                    {!isMyClass && owner && (
                      <div className="absolute -bottom-5 right-4 z-20">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-white flex items-center justify-center text-sm font-bold border-3 border-white shadow-md" style={{ border: "3px solid white" }}>
                          {owner.name ? owner.name.charAt(0).toUpperCase() : "?"}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col gap-2">
                    {/* Instructor info for enrolled */}
                    {!isMyClass && owner && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                        <FiUsers className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{owner.name || owner.email}</span>
                      </div>
                    )}

                    {/* Lab details */}
                    <div className="space-y-2">
                      {lab.subject && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FiCode className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                          <span className="truncate">{lab.subject}</span>
                        </div>
                      )}
                      {lab.room && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FiMapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                          <span>Room {lab.room}</span>
                        </div>
                      )}
                      {!lab.subject && !lab.room && !isMyClass && (
                        <div className="text-xs text-gray-400 italic">No additional details</div>
                      )}
                    </div>

                    {/* Role badge */}
                    <div className="mt-auto">
                      {isMyClass ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-50 border border-pink-200 text-xs font-medium text-pink-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                          Teaching
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          Enrolled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="border-t border-gray-100">
                    <LabCardActions lab={lab} userEmail={user.email} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}