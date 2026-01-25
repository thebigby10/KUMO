// src/app/dashboard/page.tsx

import { redirect } from "next/navigation";

import { LabController } from "@/controller/LabController";
import Link from "next/link";
import { getCurrentUser } from "@/actions/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user || !user.email) {
    redirect("/");
  }

  const labs = await LabController.getAllForUser(user.email);

  return (
    <main className="p-6">
      {labs.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-center animate-in fade-in duration-500">
          <div className="w-64 h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-400">
            No classes found
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            It&apos;s quiet here...
          </h3>
          <p className="text-gray-500">
            Create or join a class to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl">
          {labs.map((lab: any) => {
            const owner = lab.instructors[0]?.user;
            const isMyClass = owner?.email === user.email;

            return (
              <Link
                href={`/dashboard/lab/${lab.id}`}
                key={lab.id}
                className="block group h-full"
              >
                <div className="group border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer bg-white flex flex-col h-72">
                  {/* Banner */}
                  <div className="h-28 bg-blue-600 p-4 text-white relative bg-[url('https://gstatic.com/classroom/themes/img_read.jpg')] bg-cover">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-medium hover:underline truncate w-10/12">
                        {lab.name}
                      </h2>
                      <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded-full transition">
                        ⋮
                      </button>
                    </div>
                    <p className="text-sm opacity-90 truncate mt-1">
                      {lab.section}
                    </p>

                    {!isMyClass && owner && (
                      <div className="absolute bottom-3 right-3">
                        <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-medium border-4 border-white">
                          {owner.name ? owner.name.charAt(0).toUpperCase() : "M"}
                        </div>
                      </div>
                    )}

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
                  <div className="border-t p-3 flex justify-end gap-1 border-gray-100 bg-white">
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                        />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}