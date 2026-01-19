import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import { LabController } from "@/controller/LabController"; // Logic moved here
import ClassroomActionWrapper from "./ClassroomActionWrapper";
import UserMenu from "../components/UserMenu";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user || !user.email) {
    redirect("/");
  }

  // CONTROLLER CALL: Fetch labs via business logic layer
  const labs = await LabController.getAllForUser(user.email);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-3 border-b bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600">
            <div className="text-xl">☰</div>
          </button>
          <span className="text-xl font-medium text-gray-600 ml-2">
            Kumo Classroom
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ClassroomActionWrapper userEmail={user.email} />

          <div className="pl-2">
            <UserMenu email={user.email} name={user.name} />
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
            <h3 className="text-lg font-medium text-gray-900">
              It's quiet here...
            </h3>
            <p className="text-gray-500">
              Create or join a class to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {labs.map((lab: any) => {
              const owner = lab.instructors[0]?.user;
              const isMyClass = owner?.email === user.email;

              return (
                <Link
                  href={`/dashboard/lab/${lab.id}`}
                  key={lab.id}
                  className="block group h-full"
                >
                  <div
                    key={lab.id}
                    className="group border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer bg-white flex flex-col h-72"
                  >
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
                      <div className="p-2 hover:bg-gray-200 rounded-full text-gray-600 transition">
                        {/* Icon SVG... */}
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
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
