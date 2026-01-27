// src/app/dashboard/page.tsx

import { redirect } from "next/navigation";

import { LabController } from "@/controller/LabController";
import Link from "next/link";
import { getCurrentUser } from "@/actions/auth";
import LabCardActions from "@/components/LabCardActions";

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
          <p className="text-gray-500">Create or join a class to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl">
          {labs.map((lab: any) => {
            const owner = lab.instructors[0]?.user;
            const isMyClass = owner?.email === user.email;

            return (
              <div
                key={lab.id}
                className="block group h-full"
              >
                <div className="group border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer bg-white flex flex-col h-72">
                  {/* Banner */}
                  <div className="h-28 bg-blue-600 p-4 text-white relative bg-[url('https://gstatic.com/classroom/themes/img_read.jpg')] bg-cover">
                    <div className="flex justify-between items-start">
                      <Link href={`/dashboard/lab/${lab?.id}`} className="text-xl font-medium hover:underline truncate w-10/12">
                        {lab.name}
                      </Link>
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
                          {owner.name
                            ? owner.name.charAt(0).toUpperCase()
                            : "M"}
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
                  <LabCardActions lab={lab} userEmail={user.email} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
