"use client";

import { useState } from "react";
import { User, Shield, Mail, UserPlus, X } from "lucide-react";
import { removeStudent, addInstructor } from "@/app/actions/classroom-actions/lab";

type Instructor = {
  email: string;
  role: string;
};

type Student = {
  email: string;
  name: string | null;
};

interface PeopleListProps {
  instructors: Instructor[];
  students: Student[];
  labId: string;
  currentUserEmail: string;
  isOwner: boolean;
  isInstructor: boolean;
}

export default function PeopleList({
  instructors,
  students,
  labId,
  currentUserEmail,
  isOwner,
  isInstructor,
}: PeopleListProps) {
  const [showAddInstructor, setShowAddInstructor] = useState(false);
  const [instructorEmail, setInstructorEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await addInstructor(labId, instructorEmail);
      if (result.success) {
        setInstructorEmail("");
        setShowAddInstructor(false);
      } else {
        setError(result.error || "Failed to add instructor");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentEmail: string) => {
    if (!confirm(`Remove ${studentEmail} from the class?`)) return;

    try {
      await removeStudent(labId, studentEmail);
    } catch (err) {
      alert("Failed to remove student");
    }
  };

  const getInitials = (email: string) => {
    const name = email.split("@")[0];
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (email: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-teal-500",
    ];
    const index =
      email.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Instructors Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Instructors</h2>
            <span className="text-sm text-gray-500">
              {instructors.length}
            </span>
          </div>
          {isOwner && (
            <button
              onClick={() => setShowAddInstructor(!showAddInstructor)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Add Instructor
            </button>
          )}
        </div>

        {showAddInstructor && (
          <form
            onSubmit={handleAddInstructor}
            className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
          >
            <div className="flex gap-2">
              <input
                type="email"
                value={instructorEmail}
                onChange={(e) => setInstructorEmail(e.target.value)}
                placeholder="Instructor email"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Adding..." : "Add"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddInstructor(false);
                  setError("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </form>
        )}

        <div className="space-y-2">
          {instructors.map((instructor) => (
            <div
              key={instructor.email}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor(
                    instructor.email
                  )}`}
                >
                  {getInitials(instructor.email)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {instructor.email.split("@")[0]}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {instructor.email}
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                {instructor.role}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Students Section */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Students</h2>
          <span className="text-sm text-gray-500">{students.length}</span>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No students enrolled yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {students.map((student) => (
              <div
                key={student.email}
                className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor(
                      student.email
                    )}`}
                  >
                    {getInitials(student.email)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {student.email.split("@")[0]}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {student.email}
                    </p>
                  </div>
                </div>
                {isInstructor && student.email !== currentUserEmail && (
                  <button
                    onClick={() => handleRemoveStudent(student.email)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Remove student"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
