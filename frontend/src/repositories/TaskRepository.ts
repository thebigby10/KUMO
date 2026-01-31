import { db, Prisma } from "@/lib/prisma";

export class TaskRepository {
  static async create(data: Prisma.TaskCreateInput) {
    return await db.task.create({ data });
  }

  static async findById(id: string) {
    return await db.task.findUnique({
      where: { id },
      include: {
        editors: true,
        testCases: true,
        hints: true,
      },
    });
  }

  static async findAllByWorkId(workId: string) {
    return await db.task.findMany({
      where: { workId },
      include: {
        editors: true,
        testCases: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  static async update(id: string, data: Prisma.TaskUpdateInput) {
    return await db.task.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return await db.$transaction([
      db.editor.deleteMany({ where: { taskId: id } }),
      db.testCase.deleteMany({ where: { taskId: id } }),
      db.hint.deleteMany({ where: { taskId: id } }),
      db.submission.deleteMany({ where: { taskId: id } }),
      db.task.delete({ where: { id } }),
    ]);
  }
}
