"use client";

import { useState } from "react";
import { Save, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { createLabWork } from "@/app/actions/work";
import TaskEditor, { TaskData } from "./TaskEditor";

interface CreateAssignmentFormProps {
  labId: string;
  userEmail: string;
}

export default function CreateAssignmentForm({ labId, userEmail }: CreateAssignmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Logistics State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState(100);
  const [dueDate, setDueDate] = useState("");

  // Tasks State
  const [tasks, setTasks] = useState<TaskData[]>([]);

  // --- Task Management Helpers ---
  const addTask = () => {
    const newTask: TaskData = {
      id: crypto.randomUUID(),
      title: `Task ${tasks.length + 1}`,
      description: "",
      language: "python",
      starterCode: `def main():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    main()`,
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (index: number, updatedTask: TaskData) => {
    const newTasks = [...tasks];
    newTasks[index] = updatedTask;
    setTasks(newTasks);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };
  // ------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Prepare Payload
    const payload = {
      labId,
      userEmail,
      title,
      description,
      totalPoints: points,
      endTime: dueDate ? new Date(dueDate) : null,
      // Strip out the temporary UI ID before sending to DB
      tasks: tasks.map(({ id, ...rest }) => rest)
    };

    // Call Server Action
    const result = await createLabWork(payload);

    if (result.success) {
      router.push(`/dashboard/lab/${labId}/work`);
      router.refresh(); 
    } else {
      alert(result.error);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
      
      {/* Section 1: Logistics */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
          General Information
        </h3>
        
        <div className="grid gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Lab 1: Introduction to Python"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the overall goal of this lab..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Points</label>
              <input
                type="number"
                min={0}
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Coding Tasks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-medium text-gray-800">Coding Problems</h3>
          <span className="text-sm text-gray-500">{tasks.length} problems added</span>
        </div>

        {tasks.map((task, index) => (
          <TaskEditor
            key={task.id}
            index={index}
            task={task}
            onChange={(updated) => updateTask(index, updated)}
            onRemove={() => removeTask(index)}
          />
        ))}

        {/* Add Task Button */}
        <button
          type="button"
          onClick={addTask}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition group"
        >
          <div className="p-2 bg-gray-100 rounded-full group-hover:bg-blue-200 transition">
             <Plus size={20} />
          </div>
          <span className="font-medium">Add Coding Problem</span>
        </button>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="submit"
          disabled={loading || tasks.length === 0}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
        >
          <Save size={18} />
          {loading ? "Assigning..." : "Assign Lab"}
        </button>
      </div>

    </form>
  );
}