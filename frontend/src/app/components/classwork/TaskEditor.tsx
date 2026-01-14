"use client";

import Editor from "@monaco-editor/react";
import { Trash2 } from "lucide-react";

export interface TaskData {
  id: string; 
  title: string;
  description: string;
  language: "python" | "cpp" | "c" | "java";
  starterCode: string;
}

interface TaskEditorProps {
  task: TaskData;
  index: number;
  onChange: (updatedTask: TaskData) => void;
  onRemove: () => void;
}

const LANGUAGE_DEFAULTS: Record<string, string> = {
  python: `def main():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    main()`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
  c: `#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
  java: `public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`
};

export default function TaskEditor({ task, index, onChange, onRemove }: TaskEditorProps) {
  
  const updateField = (field: keyof TaskData, value: any) => {
    onChange({ ...task, [field]: value });
  };

  const handleLanguageChange = (newLang: string) => {
    onChange({ 
      ...task, 
      language: newLang as any,
      starterCode: LANGUAGE_DEFAULTS[newLang] || "" 
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition hover:border-blue-300">
      
      {/* Header: Title & Language */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-start gap-4">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Task Title (Problem Name)
            </label>
            <input
              type="text"
              value={task.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g. Calculate Factorial"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Language
            </label>
            <select
              value={task.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            >
              <option value="python">Python 3</option>
              <option value="cpp">C++ (GCC)</option>
              <option value="c">C (GCC)</option>
              <option value="java">Java (OpenJDK)</option>
            </select>
          </div>
        </div>
        <button 
          type="button"
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          title="Remove Task"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Problem Description</label>
          <textarea
            value={task.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
            placeholder="Explain what the function should do..."
          />
        </div>

        {/* The Editor (Starter Code) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Starter Code (Boilerplate)</label>
          <div className="h-64 border border-gray-300 rounded-md overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage={task.language}
              language={task.language}
              value={task.starterCode}
              onChange={(value) => updateField("starterCode", value || "")}
              theme="light"
              options={{ minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 13 }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Students will see this code when they start the assignment.</p>
        </div>
      </div>
    </div>
  );
}