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
  FiGitBranch,
  FiTarget
} from "react-icons/fi";

export default function Home() {
  const [googleError, setGoogleError] = useState("");

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setGoogleError("");
    if (credentialResponse.credential) {
      const result = await googleLoginAction(credentialResponse.credential);
      if (result?.error) {
        setGoogleError(result.error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-xl font-bold font-mono">K</span>
            </div>
            <span className="text-xl font-bold tracking-tight font-mono">KUMO</span>
          </div>
          
          <div className="flex items-center gap-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setGoogleError("Google Login Failed")}
              theme="filled_blue"
              size="large"
              text="signin"
              shape="pill"
            />
          </div>
        </div>
      </nav>

      {googleError && (
        <div className="fixed top-20 right-6 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-slide-in">
          {googleError}
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, rgb(51, 65, 85) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(51, 65, 85) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-mono mb-6">
              <FiZap className="w-4 h-4" />
              <span>AI-Enhanced Assessment Platform</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-tight">
              Standardize CS Labs<br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                with AI Precision
              </span>
            </h1>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Kumo revolutionizes coding education with secure, automated grading, 
              real-time feedback, and intelligent assessment tools designed for modern CS curricula.
            </p>

            <div className="flex items-center justify-center gap-4 pt-6">
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

            <div className="flex items-center justify-center gap-8 pt-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4 text-green-400" />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4 text-green-400" />
                <span>Instant Setup</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4 text-green-400" />
                <span>Secure & Private</span>
              </div>
            </div>
          </div>

          {/* Code Preview Mockup */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 via-blue-500/10 to-transparent blur-3xl" />
            <div className="relative bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800/50 bg-slate-900/80">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-slate-500 ml-4 font-mono">lab_assignment.py</span>
              </div>
              <div className="p-6 font-mono text-sm">
                <div className="space-y-2">
                  <div><span className="text-purple-400">def</span> <span className="text-blue-400">calculate_grade</span><span className="text-slate-400">(</span><span className="text-orange-400">submission</span><span className="text-slate-400">):</span></div>
                  <div className="pl-4"><span className="text-slate-500"># AI-powered automated grading</span></div>
                  <div className="pl-4"><span className="text-purple-400">return</span> <span className="text-blue-400">AI</span><span className="text-slate-400">.</span><span className="text-yellow-400">evaluate</span><span className="text-slate-400">(</span><span className="text-orange-400">submission</span><span className="text-slate-400">)</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 border-y border-slate-800/50 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Code Executions", value: "50K+", icon: FiCode },
              { label: "Active Labs", value: "200+", icon: FiGitBranch },
              { label: "Students Served", value: "5K+", icon: FiUsers },
              { label: "Accuracy Rate", value: "99.9%", icon: FiTarget }
            ].map((stat, i) => (
              <div 
                key={i} 
                className="text-center space-y-2 p-6 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-blue-500/50 transition-colors"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <stat.icon className="w-8 h-8 mx-auto text-blue-400 mb-3" />
                <div className="text-3xl font-bold font-mono bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built for Modern
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"> CS Education</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Everything you need to create, manage, and assess coding assignments at scale
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FiCode,
                title: "Secure Code Execution",
                description: "Sandboxed environment for running student code safely with support for multiple languages and real-time output."
              },
              {
                icon: FiZap,
                title: "AI-Powered Grading",
                description: "Automated assessment with intelligent feedback, reducing grading time by 80% while maintaining accuracy."
              },
              {
                icon: FiShield,
                title: "Plagiarism Detection",
                description: "Advanced algorithms to detect code similarity and maintain academic integrity across submissions."
              },
              {
                icon: FiTrendingUp,
                title: "Real-time Analytics",
                description: "Track student progress, identify struggling students, and gain insights into class performance metrics."
              },
              {
                icon: FiUsers,
                title: "Collaborative Tools",
                description: "Enable peer reviews, group projects, and instructor collaboration with built-in communication features."
              },
              {
                icon: FiGitBranch,
                title: "Version Control",
                description: "Track submission history, compare iterations, and provide targeted feedback on specific code changes."
              }
            ].map((feature, i) => (
              <div 
                key={i}
                className="group relative p-8 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-slate-900/30 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(59, 130, 246) 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How Kumo <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-xl text-slate-400">From assignment creation to automated grading in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Lab",
                description: "Set up your CS lab with custom assignments, test cases, and grading criteria in minutes."
              },
              {
                step: "02",
                title: "Students Submit",
                description: "Students write and test code in our secure editor, getting instant feedback before submission."
              },
              {
                step: "03",
                title: "Auto-Grade",
                description: "AI evaluates submissions against test cases, providing detailed feedback and grades instantly."
              }
            ].map((step, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-24 left-full w-full h-0.5 bg-gradient-to-r from-blue-500/50 to-transparent" />
                )}
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-bold font-mono shadow-lg shadow-blue-500/30">
                    {step.step}
                  </div>
                  <h3 className="text-2xl font-bold">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 blur-3xl" />
            <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-3xl border border-slate-700/50 p-12 space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold">
                Ready to Transform Your
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"> CS Labs?</span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Join hundreds of educators using Kumo to create better learning experiences for thousands of students
              </p>
              <div className="pt-4 flex items-center justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setGoogleError("Google Login Failed")}
                  theme="filled_blue"
                  size="large"
                  text="continue_with"
                  shape="pill"
                  width="300"
                />
              </div>
              <p className="text-sm text-slate-500">
                No credit card required • Free for educators • Enterprise plans available
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-12 px-6 bg-slate-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold font-mono">K</span>
              </div>
              <span className="text-lg font-bold font-mono">KUMO</span>
            </div>
            <div className="text-sm text-slate-500">
              © 2026 Kumo. AI-Enhanced Coding Assessment Platform.
            </div>
            <div className="flex gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}