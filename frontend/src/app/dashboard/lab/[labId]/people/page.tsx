import { notFound } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import { LabController } from "@/controller/LabController";
import PeopleList from "./PeopleList";

export default async function PeoplePage({
  params,
}: {
  params: Promise<{ labId: string }>;
}) {
  const { labId } = await params;
  const user = await getCurrentUser();

  if (!user?.email) return null;

  // CONTROLLER CALL: Fetch people data
  const people = await LabController.getMembers(labId);
  const lab = await LabController.getById(labId);

  if (!people || !lab) notFound();

  // Check user's role
  const currentUserRole = people.instructors.find(
    (inst: any) => inst.email === user.email
  );
  const isOwner = currentUserRole?.role === "OWNER";
  const isInstructor = !!currentUserRole;

  return (
    <div className="space-y-6">
      <PeopleList
        instructors={people.instructors}
        students={people.students}
        labId={labId}
        currentUserEmail={user.email}
        isOwner={isOwner}
        isInstructor={isInstructor}
      />
    </div>
  );
}
