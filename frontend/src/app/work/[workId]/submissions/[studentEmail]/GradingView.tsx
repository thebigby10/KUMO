"use client";

import { useState } from "react";
import {
  Code,
  Play,
  CheckCircle2,
  XCircle,
  Send,
  Loader2,
  FileCode,
  MessageSquare,
  Award,
} from "lucide-react";
import { gradeSubmission, runTestsForTask } from "@/app/actions/grading";

// Types for the component
interface TestCase {
  id: string;
  input: string;
  expectOutput: string;
}

interface Editor {
  id: string;
  solution: string;
  description: string | null;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  point: number;
  testCases: TestCase[];
  editors: Editor[];
}

interface SubmissionRecord {
  id: string;
  code: string;
  language: string;
  task: {
    id: string;
    title: string;
    point: number;
  };
}

interface Submission {
  id: string;
  status: "DRAFT" | "SUBMITTED" | "RETURNED";
  grade: number | null;
  feedback: string | null;
  submittedAt: Date | null;
  user: {
    email: string;
    name: string | null;
    avatar: string | null;
  };
  records: SubmissionRecord[];
}

interface TestResult {
  testCaseId: string;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  error?: string | null;
}

interface GradingViewProps {
  workId: string;
  submission: Submission;
  tasks: Task[];
  totalPoints: number;
}

export default function GradingView({
  workId,
  submission,
  tasks,
  totalPoints,
}: GradingViewProps) {
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0);
  const [grade, setGrade] = useState<string>(
    submission.grade?.toString() || ""
  );
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const selectedTask = tasks[selectedTaskIndex];
  const taskRecord = submission.records.find(
    (r) => r.task.id === selectedTask?.id
  );

  const handleRunTests = async () => {
    if (!taskRecord) return;

    setIsRunningTests(true);
    setTestResults(null);
    setMessage(null);

    try {
      const result = await runTestsForTask(submission.id, selectedTask.id);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else if (result.results) {
        setTestResults(result.results);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to run tests" });
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleSubmitGrade = async () => {
    const gradeNum = parseInt(grade);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > totalPoints) {
      setMessage({
        type: "error",
        text: `Grade must be between 0 and ${totalPoints}`,
      });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await gradeSubmission(submission.id, gradeNum, feedback);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Grade submitted successfully!" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to submit grade" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Code View */}
      <div className="lg:col-span-2 space-y-6">
        {/* Task Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tasks.map((task, index) => {
                const hasCode = submission.records.some(
                  (r) => r.task.id === task.id
                );
                return (
                  <button
                    key={task.id}
                    onClick={() => {
                      setSelectedTaskIndex(index);
                      setTestResults(null);
                    }}
                    className={`
                      flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition
                      ${
                        selectedTaskIndex === index
                          ? "border-blue-500 text-blue-600 bg-blue-50/50"
                          : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                      }
                    `}
                  >
                    <FileCode size={16} />
                    <span className="font-medium">{task.title}</span>
                    {hasCode && (
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Display */}
          <div className="p-4">
            {taskRecord ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Code size={16} />
                    <span>
                      Language: <strong>{taskRecord.language}</strong>
                    </span>
                  </div>
                  <button
                    onClick={handleRunTests}
                    disabled={isRunningTests || selectedTask.testCases.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isRunningTests ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Play size={16} />
                    )}
                    Run Tests
                  </button>
                </div>

                <div className="bg-[#1e1e1e] rounded-lg overflow-hidden">
                  <pre className="p-4 overflow-x-auto text-sm text-gray-100 font-mono leading-relaxed max-h-[500px] overflow-y-auto">
                    <code>{taskRecord.code}</code>
                  </pre>
                </div>
              </>
            ) : (
              <div className="py-16 text-center text-gray-500">
                <Code size={40} className="mx-auto mb-4 text-gray-300" />
                <p>No code submitted for this task</p>
              </div>
            )}
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Test Results</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle2 size={16} />
                  {testResults.filter((r) => r.passed).length} passed
                </span>
                <span className="text-red-600 flex items-center gap-1">
                  <XCircle size={16} />
                  {testResults.filter((r) => !r.passed).length} failed
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {testResults.map((result, index) => (
                <div
                  key={result.testCaseId}
                  className={`p-4 ${
                    result.passed ? "bg-green-50/50" : "bg-red-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {result.passed ? (
                      <CheckCircle2 size={18} className="text-green-600" />
                    ) : (
                      <XCircle size={18} className="text-red-600" />
                    )}
                    <span className="font-medium text-gray-800">
                      Test Case {index + 1}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Input</p>
                      <pre className="bg-gray-100 p-2 rounded text-gray-700 font-mono text-xs">
                        {result.input || "(empty)"}
                      </pre>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Expected</p>
                      <pre className="bg-gray-100 p-2 rounded text-gray-700 font-mono text-xs">
                        {result.expected}
                      </pre>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Actual</p>
                      <pre
                        className={`p-2 rounded font-mono text-xs ${
                          result.passed
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {result.error || result.actual || "(empty)"}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Grading Panel */}
      <div className="space-y-6">
        {/* Task Info */}
        {selectedTask && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-800 mb-2">
              {selectedTask.title}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {selectedTask.description || "No description"}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">
                Points: <strong>{selectedTask.point}</strong>
              </span>
              <span className="text-gray-500">
                Tests: <strong>{selectedTask.testCases.length}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Grading Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Award size={18} />
            Grade Submission
          </h3>

          {/* Message */}
          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Grade Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max={totalPoints}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="0"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              <span className="text-gray-500 font-medium">/ {totalPoints}</span>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MessageSquare size={14} className="inline mr-1" />
              Feedback (optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              placeholder="Provide feedback for the student..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmitGrade}
            disabled={isSubmitting || !grade}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            {submission.status === "RETURNED" ? "Update Grade" : "Submit Grade"}
          </button>
        </div>

        {/* Submission Info */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-sm text-gray-600 space-y-2">
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="font-medium">{submission.status}</span>
          </div>
          {submission.submittedAt && (
            <div className="flex justify-between">
              <span>Submitted:</span>
              <span className="font-medium">
                {new Date(submission.submittedAt).toLocaleString()}
              </span>
            </div>
          )}
          {submission.grade !== null && (
            <div className="flex justify-between">
              <span>Current Grade:</span>
              <span className="font-medium">
                {submission.grade}/{totalPoints}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
