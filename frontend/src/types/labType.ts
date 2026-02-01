// ── Lab ───────────────────────────────────────────────────────────────────────
export interface Lab {
    id: string;
    banner: string | null;
    name: string;
    description: string | null;
    section: string | null;
    subject: string | null;
    room: string | null;
    labCode: string;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface LabInstructor {
    id: string;
    labId: string;
    userEmail: string;
    role: string;
    user: User;
}

export interface LabType {
    id: string;
    name: string;
    section: string | null;
    subject: string | null;
    room: string | null;
    banner: string | null;
    description: string | null;
    labCode: string;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
    instructors: LabInstructor[];
}

// ── User ──────────────────────────────────────────────────────────────────────
export interface User {
    id: string;
    email: string;
    name: string | null;
    password: string | null;
    avatar: string | null;
    googleId: string | null;
    isEmailVerified: boolean;
    provider: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CurrentUser {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
}

// ── Task ──────────────────────────────────────────────────────────────────────
export type TaskLanguage = "python" | "c" | "cpp" | "java";

export interface Task {
    id: string;
    title: string;
    description: string | null;
    url: string | null;
    initialCode: string | null;
    initialLanguage: string | null;
    testCaseCount: number;
    workId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TestCase {
    id: string;
    taskId: string;
    input: string;
    expectedOutput: string;
}

export interface TestResult {
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
    error?: string;
}

// ── Submission ─────────────────────────────────────────────────────────────────
export type SubmissionStatus = "pending" | "submitted" | "graded" | "failed";

export interface Submission {
    id: string;
    taskId: string;
    userId: string;
    code: string;
    language: TaskLanguage;
    status: SubmissionStatus;
    score: number | null;
    feedback: string | null;
    testResults: TestResult[];
    submittedAt: Date;
    gradedAt: Date | null;
}

// ── AI Detection ──────────────────────────────────────────────────────────────
export interface AiDetectionResult {
    isAiGenerated: boolean;
    confidence: number;
    reasoning: string;
}

// ── Work (Assignment instance) ─────────────────────────────────────────────────
export type WorkStatus = "active" | "closed" | "draft";

export interface Work {
    id: string;
    title: string;
    description: string | null;
    labId: string;
    status: WorkStatus;
    endTime: string | null;
    createdAt: Date;
    updatedAt: Date;
    tasks: Task[];
}
