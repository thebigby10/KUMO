import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Calendar, FileCode } from "lucide-react";
import prisma from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/actions/auth";

export default async function ClassworkPage({
  params,
}: {
  params: Promise<{ labId: string }>;
}) {
  const { labId } = await params;
  const user = await getCurrentUser();

  if (!user?.email) return null;

  // 1. Fetch Lab and its Works (Assignments)
  const lab = await prisma.lab.findUnique({
    where: { id: labId },
    include: {
      instructors: true,
      labWorks: {
        orderBy: { createdAt: "desc" },
        include: {
          tasks: true, // To count how many coding problems are inside
        }
      },
    },
  });

  if (!lab) notFound();

  const isInstructor = lab.instructors.some((inst) => inst.userEmail === user.email);

  return (
    <div className="space-y-6">
      
      {/* 1. Header / Create Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Classwork</h2>
        
        {isInstructor && (
          <Link
            // FIX 1: Point to the Create Form Page
            href={`/dashboard/lab/${labId}/work/create`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-sm font-medium"
          >
            <Plus size={20} />
            <span>Create</span>
          </Link>
        )}
      </div>

      {/* 2. Assignments List */}
      <div className="space-y-4">
        {lab.labWorks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <FileCode size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No assignments yet</h3>
            <p className="text-gray-500 max-w-sm mt-1">
              {isInstructor 
                ? "Create your first coding lab to get students started." 
                : "Your teacher hasn't posted any work yet."}
            </p>
          </div>
        ) : (
          lab.labWorks.map((work) => (
            <Link 
              key={work.id} 
              // FIX 2: Point to the New Standalone Editor Page
              href={`/work/${work.id}`}
              className="group block bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-400 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                    <FileCode size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition">
                      {work.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {work.tasks.length} {work.tasks.length === 1 ? "Task" : "Tasks"} • {work.totalPoints} Points
                    </p>
                  </div>
                </div>
                
                {work.endTime && (
                  <div className="text-xs text-gray-500 flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full">
                    <Calendar size={14} />
                    Due {new Date(work.endTime).toLocaleDateString()}
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}