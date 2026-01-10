"use client";

import { GoogleLogin } from "@react-oauth/google";
import { googleLoginAction } from "@/actions/auth";
import { useState } from "react";
import {
  FiCode,
  FiCheckCircle,
  FiTrendingUp,
  FiUsers,
  FiZap,
  FiShield,
  FiCpu,
  FiUpload,
  FiMessageSquare,
  FiArrowRight,
  FiPlay,
  FiBook,
  FiBarChart2,
} from "react-icons/fi";

export default function Home() {
  const [googleError, setGoogleError] = useState("");

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    setGoogleError("");
    if (credentialResponse.credential) {
      const result = await googleLoginAction(credentialResponse.credential);
      if (result?.error) {
        setGoogleError(result.error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-lg font-bold font-mono">K</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 font-mono">KUMO</span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-gray-900 transition-colors">How it works</a>
            <a href="#instructors" className="hover:text-gray-900 transition-colors">For Instructors</a>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4">
            {googleError && (
              <span className="text-xs text-red-500">{googleError}</span>
            )}
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setGoogleError("Google Login Failed")}
              theme="outline"
              size="medium"
              text="signin"
              shape="pill"
            />
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-rose-50" />
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-30"
            style={{
              background:
                "radial-gradient(ellipse at center, #FBCFE8 0%, transparent 70%)",
            }}
          />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(to right, #1F2937 1px, transparent 1px),
                linear-gradient(to bottom, #1F2937 1px, transparent 1px)
              `,
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          {/* Eyebrow badge */}
          <div className="animate-fade-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-sm font-medium mb-8">
            <FiZap className="w-3.5 h-3.5" />
            <span>AI-Enhanced Coding Assessment Platform</span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in delay-100 text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-gray-900 mb-6">
            Standardize CS Labs
            <br />
            <span
              className="animate-gradient"
              style={{
                backgroundImage: "linear-gradient(135deg, #EC4899, #DB2777, #9333EA, #EC4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                backgroundSize: "200% auto",
              }}
            >
              with AI Precision
            </span>
          </h1>

          {/* Subheading */}
          <p className="animate-fade-in delay-200 text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
            Kumo revolutionizes coding education with secure, automated grading,
            real-time AI feedback, and intelligent assessment — designed for modern CS curricula.
          </p>

          {/* CTA buttons */}
          <div className="animate-fade-in delay-300 flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setGoogleError("Google Login Failed")}
              theme="filled_blue"
              size="large"
              text="continue_with"
              shape="pill"
              width="260"
            />
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition-all"
            >
              Explore Features <FiArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Trust badges */}
          <div className="animate-fade-in delay-400 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            {[
              "No credit card required",
              "Instant setup",
              "Secure & private",
            ].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <FiCheckCircle className="w-4 h-4 text-emerald-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Code mockup */}
          <div className="animate-fade-in delay-500 mt-16 mx-auto max-w-3xl">
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-pink-200/40 via-transparent to-transparent blur-2xl -z-10 translate-y-8" />
              {/* Window */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                {/* Title bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-xs text-gray-400 font-mono ml-3">lab_assignment.py</span>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">● Online</span>
                  </div>
                </div>
                {/* Code */}
                <div className="p-6 font-mono text-sm text-left bg-gray-50">
                  <div className="space-y-1.5">
                    <div><span className="text-purple-600">def</span> <span className="text-blue-600">calculate_fibonacci</span><span className="text-gray-500">(</span><span className="text-orange-500">n</span><span className="text-gray-500">: int) -{">"} list:</span></div>
                    <div className="pl-6"><span className="text-gray-400"># Student solution — auto-graded by KUMO</span></div>
                    <div className="pl-6"><span className="text-purple-600">if</span> <span className="text-orange-500">n</span> <span className="text-gray-600">&lt;=</span> <span className="text-emerald-600">0</span><span className="text-gray-500">:</span></div>
                    <div className="pl-12"><span className="text-purple-600">return</span> <span className="text-gray-500">[]</span></div>
                    <div className="pl-6"><span className="text-gray-400">...</span></div>
                  </div>
                  {/* AI Detection badge */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <FiShield className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700">Human Written — 94% confidence</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                      <FiCheckCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs font-medium text-blue-700">3/3 Tests Passed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <section className="py-16 px-6 border-y border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Code Executions", value: "50K+", icon: FiCode },
              { label: "Active Labs", value: "200+", icon: FiBook },
              { label: "Students Served", value: "5K+", icon: FiUsers },
              { label: "AI Accuracy Rate", value: "99.1%", icon: FiTrendingUp },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-pink-200 transition-all"
              >
                <stat.icon className="w-6 h-6 mx-auto text-pink-500 mb-3" />
                <div className="text-3xl font-bold text-gray-900 font-mono mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ───────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-sm font-medium mb-4">
              Platform Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Built for Modern{" "}
              <span className="text-pink-500">CS Education</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Everything you need to create, manage, and assess coding assignments at scale
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FiCpu,
                title: "AI Coding Assistant",
                description:
                  "Students get intelligent hints and explanations from an AI tutor grounded in the lab's PDF materials — no cheating, just guided learning.",
                color: "bg-purple-50 text-purple-600 border-purple-100",
                accent: "group-hover:border-purple-300",
              },
              {
                icon: FiShield,
                title: "AI Code Detection",
                description:
                  "Advanced AI analysis detects whether student code was written by a human or generated by an AI model, with confidence scores and reasoning.",
                color: "bg-rose-50 text-rose-600 border-rose-100",
                accent: "group-hover:border-rose-300",
              },
              {
                icon: FiUsers,
                title: "Classroom Management",
                description:
                  "Create labs, invite students via join codes, manage roles, and track progress in one unified dashboard.",
                color: "bg-blue-50 text-blue-600 border-blue-100",
                accent: "group-hover:border-blue-300",
              },
              {
                icon: FiPlay,
                title: "Code Execution Engine",
                description:
                  "Sandboxed multi-language execution with real-time stdout, stderr, and execution time display. Currently supports Python.",
                color: "bg-emerald-50 text-emerald-600 border-emerald-100",
                accent: "group-hover:border-emerald-300",
              },
              {
                icon: FiUpload,
                title: "Lab Assignments",
                description:
                  "Instructors create structured lab assignments with PDF tasks, test cases, time limits, and automated scoring.",
                color: "bg-amber-50 text-amber-600 border-amber-100",
                accent: "group-hover:border-amber-300",
              },
              {
                icon: FiBarChart2,
                title: "Real-time Analytics",
                description:
                  "Track individual student progress, identify at-risk students, and gain class-wide insights to improve outcomes.",
                color: "bg-pink-50 text-pink-600 border-pink-100",
                accent: "group-hover:border-pink-300",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`group p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 ${feature.accent} hover:-translate-y-1`}
              >
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform ${feature.color}`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform Workflow ──────────────────────────────────── */}
      <section id="workflow" className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-sm font-medium mb-4">
              Student Journey
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How Kumo <span className="text-pink-500">Works</span>
            </h2>
            <p className="text-xl text-gray-500">
              From lab creation to graded results in minutes
            </p>
          </div>

          {/* Workflow steps */}
          <div className="grid md:grid-cols-6 gap-4 items-center">
            {[
              { label: "Student", icon: FiUsers, desc: "Joins the lab", color: "bg-blue-500" },
              { label: "Code", icon: FiCode, desc: "Writes solution", color: "bg-purple-500" },
              { label: "AI Assist", icon: FiMessageSquare, desc: "Gets guidance", color: "bg-pink-500" },
              { label: "Submit", icon: FiUpload, desc: "Submits work", color: "bg-amber-500" },
              { label: "Detection", icon: FiShield, desc: "AI scans code", color: "bg-rose-500" },
              { label: "Result", icon: FiCheckCircle, desc: "Gets grade", color: "bg-emerald-500" },
            ].map((step, i) => (
              <div key={i} className="contents">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center shadow-md`}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{step.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{step.desc}</div>
                  </div>
                </div>
                {i < 5 && (
                  <div className="hidden md:flex items-center justify-center">
                    <div className="w-full h-0.5 bg-gradient-to-r from-gray-200 to-gray-300 relative">
                      <FiArrowRight className="absolute -top-2.5 right-0 text-gray-400 w-5 h-5" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* How it works cards */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Instructor Creates Lab",
                description:
                  "Set up a lab with custom assignments, upload PDF materials, define test cases, and set time limits in minutes.",
              },
              {
                step: "02",
                title: "Students Code & Get AI Help",
                description:
                  "Students use the secure in-browser editor, run code in real time, and ask the AI assistant questions about the task.",
              },
              {
                step: "03",
                title: "Auto-Graded with AI Insights",
                description:
                  "After submission, code runs against test cases, AI detects origin, and the instructor gets a full analytics report.",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-pink-200 transition-all"
              >
                <div className="text-5xl font-bold text-pink-100 font-mono absolute top-4 right-5 select-none">
                  {card.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 relative">{card.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed relative">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Instructor Section ─────────────────────────────────── */}
      <section id="instructors" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-sm font-medium mb-6">
                For Instructors
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Create Labs.
                <br />
                <span className="text-pink-500">Track Progress.</span>
                <br />
                Save Time.
              </h2>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                KUMO gives instructors powerful tools to create structured lab assignments,
                monitor real-time student progress, and get instant AI-powered insights —
                all without leaving the platform.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: FiBook, text: "Create labs with PDF tasks and test cases in minutes" },
                  { icon: FiBarChart2, text: "See per-student code submissions and grades at a glance" },
                  { icon: FiShield, text: "AI detection flags suspicious submissions automatically" },
                  { icon: FiUsers, text: "Manage multiple lab sections and student cohorts" },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-50 border border-pink-200 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="w-4 h-4 text-pink-600" />
                    </div>
                    <span className="text-gray-600">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual panel */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-rose-100 rounded-3xl blur-2xl opacity-60 scale-95" />
              <div className="relative bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                {/* Mini dashboard preview */}
                <div className="bg-gray-50 border-b border-gray-100 px-5 py-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">Lab Analytics</span>
                  <span className="text-xs text-gray-400">CS101 – Fall 2025</span>
                </div>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-0 border-b border-gray-100">
                  {[
                    { label: "Submitted", value: "28/32" },
                    { label: "Avg Score", value: "86%" },
                    { label: "AI Flagged", value: "2" },
                  ].map((stat, i) => (
                    <div key={i} className={`p-4 text-center ${i < 2 ? "border-r border-gray-100" : ""}`}>
                      <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>
                {/* Student rows */}
                <div className="divide-y divide-gray-50 px-1">
                  {[
                    { name: "Alice Johnson", score: 98, status: "Human", statusColor: "text-emerald-600 bg-emerald-50" },
                    { name: "Bob Smith", score: 72, status: "Human", statusColor: "text-emerald-600 bg-emerald-50" },
                    { name: "Carol White", score: 85, status: "AI ⚠️", statusColor: "text-rose-600 bg-rose-50" },
                    { name: "David Lee", score: 91, status: "Human", statusColor: "text-emerald-600 bg-emerald-50" },
                  ].map((student, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-xs font-bold">
                          {student.name[0]}
                        </div>
                        <span className="text-sm text-gray-700">{student.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900">{student.score}%</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${student.statusColor}`}>
                          {student.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-12 text-center overflow-hidden">
            {/* Pattern overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, #fff 1px, transparent 1px)`,
                backgroundSize: "32px 32px",
              }}
            />
            {/* Blur glow */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-white/20 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to Transform
                <br />
                Your CS Labs?
              </h2>
              <p className="text-xl text-pink-100 max-w-xl mx-auto mb-10">
                Join educators using KUMO to build better learning experiences for thousands of students.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="bg-white rounded-full overflow-hidden shadow-lg">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setGoogleError("Google Login Failed")}
                    theme="filled_blue"
                    size="large"
                    text="continue_with"
                    shape="pill"
                    width="280"
                  />
                </div>
              </div>
              <p className="text-sm text-pink-200 mt-6">
                No credit card required · Free for educators · Enterprise plans available
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold font-mono">K</span>
                </div>
                <span className="text-lg font-bold font-mono text-gray-900">KUMO</span>
              </div>
              <p className="text-sm text-gray-400">AI-Enhanced Coding Assessment Platform</p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-8 text-sm text-gray-500">
              <div>
                <p className="font-semibold text-gray-900 mb-2">Platform</p>
                <div className="space-y-1">
                  <a href="#features" className="block hover:text-pink-500 transition-colors">Features</a>
                  <a href="#workflow" className="block hover:text-pink-500 transition-colors">How it works</a>
                  <a href="#instructors" className="block hover:text-pink-500 transition-colors">Instructors</a>
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">Legal</p>
                <div className="space-y-1">
                  <a href="#" className="block hover:text-pink-500 transition-colors">Privacy Policy</a>
                  <a href="#" className="block hover:text-pink-500 transition-colors">Terms of Service</a>
                  <a href="#" className="block hover:text-pink-500 transition-colors">Support</a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
            © 2026 KUMO. All rights reserved.
          </div>
        </div>
      </footer>

      
    </div>
  );
}