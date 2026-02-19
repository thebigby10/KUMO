// src/app/dashboard/lab/[labId]/page.tsx

import { notFound } from "next/navigation";
import { FiMoreVertical, FiCopy, FiCalendar } from "react-icons/fi";
import { LabController } from "@/controller/LabController";
import { getCurrentUser } from "@/actions/auth";
import AnnouncementInput from "@/components/stream/AnnouncementInput";
import CopyLabCodeButton from "@/components/CopyLabCodeButton";

export default async function LabStreamPage({
  params,
}: {
  params: Promise<{ labId: string }>;
}) {
  const { labId } = await params;
  const user = await getCurrentUser();

  if (!user?.email) return null;

  const lab = await LabController.getById(labId);

  if (!lab) notFound();

  const isInstructor = lab.instructors.some(
    (inst) => inst.userEmail === user.email,
  );

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className={`relative h-64 rounded-2xl overflow-hidden shadow-2xl ${
        lab.banner?.startsWith("http") ? "" : (lab.banner || "bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600")
      }`}>
        {lab.banner?.startsWith("http") && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${lab.banner})` }}
          />
        )}
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `
            linear-gradient(to right, white 1px, transparent 1px),
            linear-gradient(to bottom, white 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }} />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        <div className="relative h-full p-8 flex flex-col justify-end text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{lab.name}</h1>
          <p className="text-xl font-medium opacity-90">{lab.section}</p>
          {lab.subject && (
            <p className="text-sm mt-2 opacity-80 inline-flex items-center gap-2">
              <FiCalendar className="w-4 h-4" />
              {lab.subject}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* LEFT COLUMN: Class Info */}
        <div className="space-y-4">
          {isInstructor ? (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-300">
                  Lab Code
                </span>
                <button className="text-slate-400 hover:text-white hover:bg-slate-700 p-1.5 rounded-lg transition-colors">
                  <FiMoreVertical size={16} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold font-mono text-blue-400 tracking-wider">
                  {lab.labCode}
                </span>
                <CopyLabCodeButton code={lab.labCode} />
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Share this code with students to join
              </p>
            </div>
          ) : (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 shadow-xl">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">
                Upcoming
              </h3>
              <p className="text-xs text-slate-500 mb-4">No work due soon</p>
              <button className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                View all →
              </button>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">
              Quick Stats
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Students</span>
                <span className="text-sm font-semibold text-white">
                  {lab.enrollments?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Assignments</span>
                <span className="text-sm font-semibold text-white">
                  {lab.works?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Stream Feed */}
        <div className="space-y-6">
          <AnnouncementInput
            labId={lab.id}
            userEmail={user.email}
            userAvatarChar={user.email.charAt(0).toUpperCase()}
          />

          {lab.announcements.length === 0 ? (
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-12 text-center">
              <div className="w-24 h-24 bg-slate-700/50 mb-6 rounded-2xl mx-auto flex items-center justify-center">
                <span className="text-5xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Start the conversation
              </h3>
              <p className="text-sm text-slate-400">
                Share announcements and updates with your class
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {lab.announcements.map((post) => (
                <div
                  key={post.id}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        {post.user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">
                          {post.user.name || post.user.email}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(post.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </div>

                  {/* Materials */}
                  {post.materials && post.materials.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700 space-y-2">
                      {post.materials.map((material: any) => (
                        <a
                          key={material.id}
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors group"
                        >
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <FiCalendar className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors truncate">
                              {material.title}
                            </p>
                            {material.description && (
                              <p className="text-xs text-slate-500 truncate">
                                {material.description}
                              </p>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}