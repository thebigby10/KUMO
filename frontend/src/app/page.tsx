"use client";

import { GoogleLogin } from "@react-oauth/google";
import { googleLoginAction } from "@/actions/auth";
import { useEffect, useState } from "react";
import {
  FiCode,
  FiCheckCircle,
  FiTrendingUp,
  FiUsers,
  FiZap,
  FiShield,
  FiGitBranch,
  FiTarget,
  FiStar,
  FiMessageCircle,
  FiShieldOff,
  FiZapOff,
} from "react-icons/fi";

export default function Home() {
  const [googleError, setGoogleError] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setGoogleError("");
    if (credentialResponse.credential) {
      const result = await googleLoginAction(credentialResponse.credential);
      if (result?.error) {
        setGoogleError(result.error);
      }
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 text-slate-900">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 backdrop-blur-md transition-all duration-500 ${
          scrolled
            ? "bg-white/80 border-b border-rose-200 shadow-lg shadow-rose-200/30"
            : "bg-white/60 border-b border-rose-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-fuchsia-600 rounded-lg flex items-center justify-center shadow-lg shadow-rose-500/30">
              <span className="text-xl font-bold font-mono text-white">K</span>
            </div>
            <span className="text-xl font-bold tracking-tight font-mono text-rose-700">
              KUMO
            </span>
          </div>

          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setGoogleError("Google Login Failed")}
            theme="filled_blue"
            size="large"
            text="signin"
            shape="pill"
          />
        </div>
      </nav>

      {googleError && (
        <div className="fixed top-20 right-6 bg-red-500 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-slide-in">
          {googleError}
        </div>
      )}

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Floating Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-300/40 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-fuchsia-300/40 rounded-full blur-3xl animate-float delay-2000" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 border border-rose-300 text-rose-700 text-sm font-mono animate-reveal">
              <FiZap className="w-4 h-4" />
              AI-Enhanced Assessment Platform
            </div>

            <h1 className="text-6xl md:text-7xl font-bold tracking-tight animate-reveal">
              Standardize CS Labs
              <br />
              <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 bg-clip-text text-transparent">
                with AI Precision
              </span>
            </h1>

            <p className="text-xl text-slate-600 max-w-2xl mx-auto animate-reveal">
              Kumo modernizes coding education with secure automated grading,
              real-time feedback, and intelligent assessment tools.
            </p>

            <div className="flex justify-center animate-reveal">
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

            <div className="flex justify-center gap-8 text-sm text-slate-500 animate-reveal">
              {["No Credit Card", "Instant Setup", "Secure & Private"].map(
                (item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <FiCheckCircle className="text-rose-500" />
                    {item}
                  </div>
                ),
              )}
            </div>
          </div>

          {/* 3D Card */}
          <div className="mt-20 max-w-4xl mx-auto animate-reveal">
            <div className="group relative bg-white border border-rose-200 rounded-3xl shadow-2xl overflow-hidden transform transition-transform duration-500 hover:-translate-y-2 hover:shadow-rose-200/60">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-200 flex items-center justify-center">
                      <FiCode className="text-rose-500 w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-lg font-bold">AI Grading Engine</div>
                      <div className="text-sm text-slate-500">
                        Instant feedback + smart scoring
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-rose-500 font-bold">3D Tilt</div>
                </div>

                <div className="mt-6">
                  <div className="relative bg-slate-900 text-white rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <span className="text-xs text-slate-300 ml-4 font-mono">
                        lab_assignment.py
                      </span>
                    </div>
                    <div className="p-6 font-mono text-sm">
                      <div>
                        <span className="text-purple-300">def</span>{" "}
                        <span className="text-pink-300">calculate_grade</span>(
                        <span className="text-yellow-300">submission</span>):
                      </div>
                      <div className="pl-4 text-slate-400">
                        # AI-powered grading
                      </div>
                      <div className="pl-4">
                        <span className="text-purple-300">return</span>{" "}
                        <span className="text-blue-300">AI</span>.
                        <span className="text-pink-300">evaluate</span>(
                        submission)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  {["Fast", "Accurate", "Secure"].map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-sm border border-rose-200 text-rose-600 bg-rose-50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-white/60 border-y border-rose-200">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Code Executions", value: "50K+", icon: FiCode },
            { label: "Active Labs", value: "200+", icon: FiGitBranch },
            { label: "Students", value: "5K+", icon: FiUsers },
            { label: "Accuracy", value: "99.9%", icon: FiTarget },
          ].map((s, i) => (
            <div
              key={i}
              className="p-6 text-center bg-white border border-rose-200 rounded-xl hover:shadow-lg hover:shadow-rose-200/50 transition-transform transform hover:-translate-y-1 motion-reduce:transform-none animate-stat-stagger"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <s.icon className="w-8 h-8 mx-auto text-rose-500 mb-3" />
              <div className="text-3xl font-bold text-rose-600">{s.value}</div>
              <div className="text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold">
              Built for Modern{" "}
              <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 bg-clip-text text-transparent">
                CS Education
              </span>
            </h2>
            <p className="text-xl text-slate-600">
              Everything you need to create, manage, and assess coding
              assignments at scale.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FiShield,
                title: "Plagiarism Detection",
                desc: "Advanced similarity algorithms to protect integrity.",
              },
              {
                icon: FiTrendingUp,
                title: "Real-time Analytics",
                desc: "Track progress and identify struggling students early.",
              },
              {
                icon: FiGitBranch,
                title: "Version Control",
                desc: "Compare submissions and track student progress.",
              },
              {
                icon: FiZap,
                title: "AI-Powered Grading",
                desc: "Instant feedback with accurate scoring.",
              },
              {
                icon: FiUsers,
                title: "Collaboration Tools",
                desc: "Peer reviews, group projects, and feedback loops.",
              },
              {
                icon: FiCode,
                title: "Secure Code Execution",
                desc: "Sandboxed environment for safe evaluation.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="p-8 bg-white border border-rose-200 rounded-2xl hover:shadow-xl hover:shadow-rose-200/40 transition-transform transform hover:-translate-y-1 motion-reduce:transform-none animate-card-stagger"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <f.icon className="w-8 h-8 text-rose-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 bg-white/60 border-t border-rose-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold">
              Simple Pricing
              <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 bg-clip-text text-transparent">
                {" "}
                for Educators
              </span>
            </h2>
            <p className="text-xl text-slate-600">
              Start free, scale as your class grows.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Free",
                price: "$0",
                desc: "Perfect for individual educators.",
                benefits: ["Up to 50 students", "Basic grading", "Community support"],
                badge: "Most popular",
              },
              {
                title: "Pro",
                price: "$29/mo",
                desc: "For growing classes & departments.",
                benefits: ["Unlimited students", "Advanced analytics", "Priority support"],
                badge: "Best value",
              },
              {
                title: "Enterprise",
                price: "Contact",
                desc: "Custom solutions for universities.",
                benefits: ["Custom integrations", "Dedicated onboarding", "SLAs"],
                badge: "Custom",
              },
            ].map((p, i) => (
              <div
                key={i}
                className="relative p-8 bg-white border border-rose-200 rounded-3xl shadow-lg hover:shadow-rose-200/50 transition-transform transform hover:-translate-y-1 motion-reduce:transform-none animate-card-stagger"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="absolute -top-4 right-4 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-bold">
                  {p.badge}
                </div>
                <div className="text-2xl font-bold mb-2">{p.title}</div>
                <div className="text-4xl font-bold text-rose-600 mb-4">
                  {p.price}
                </div>
                <div className="text-slate-600 mb-6">{p.desc}</div>
                <ul className="space-y-2 text-slate-700">
                  {p.benefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <FiCheckCircle className="text-rose-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold">
              Trusted by Educators
              <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 bg-clip-text text-transparent">
                {" "}
                Worldwide
              </span>
            </h2>
            <p className="text-xl text-slate-600">
              Real feedback from real classrooms.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Prof. Ayesha",
                quote:
                  "Kumo reduced my grading time by 80%. Students love the instant feedback.",
              },
              {
                name: "Mr. Rahim",
                quote:
                  "The plagiarism detection is a lifesaver. My classes are more secure.",
              },
              {
                name: "Dr. Naila",
                quote:
                  "The analytics helped me identify struggling students early and support them.",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="p-8 bg-white border border-rose-200 rounded-3xl shadow-lg hover:shadow-rose-200/50 transition-transform transform hover:-translate-y-1 motion-reduce:transform-none animate-card-stagger"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-200 flex items-center justify-center">
                    <FiStar className="text-rose-500 w-6 h-6" />
                  </div>
                  <div className="font-bold">{t.name}</div>
                </div>
                <div className="text-slate-600">{t.quote}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-white/60 border-t border-rose-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold">
              Frequently Asked
              <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 bg-clip-text text-transparent">
                {" "}
                Questions
              </span>
            </h2>
            <p className="text-xl text-slate-600">
              Quick answers to common questions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                q: "Can I use it for free?",
                a: "Yes, the Free plan supports up to 50 students and basic grading.",
              },
              {
                q: "Does it support multiple languages?",
                a: "Yes, Kumo supports multiple programming languages with sandbox execution.",
              },
              {
                q: "Is student data secure?",
                a: "Yes, we use secure storage and privacy-first policies.",
              },
              {
                q: "Can I integrate with LMS?",
                a: "Yes, Enterprise plan supports custom integrations.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="p-8 bg-white border border-rose-200 rounded-3xl shadow-lg hover:shadow-rose-200/50 transition-transform transform hover:-translate-y-1 motion-reduce:transform-none animate-card-stagger"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="font-bold mb-2">{f.q}</div>
                <div className="text-slate-600">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-300/30 via-pink-300/30 to-fuchsia-300/30 blur-3xl animate-pulse" />
            <div className="relative bg-white border border-rose-200 rounded-3xl p-12 space-y-8 shadow-lg">
              <h2 className="text-4xl md:text-5xl font-bold">
                Ready to Transform Your{" "}
                <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 bg-clip-text text-transparent">
                  CS Labs?
                </span>
              </h2>
              <p className="text-xl text-slate-600">
                Join hundreds of educators using Kumo to create better learning experiences.
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
      <footer className="border-t border-rose-200 py-12 px-6 bg-rose-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="font-mono font-bold text-rose-700">© 2026 KUMO</span>
          <div className="flex gap-6 text-sm text-slate-600">
            <a className="hover:text-rose-600">Privacy</a>
            <a className="hover:text-rose-600">Terms</a>
            <a className="hover:text-rose-600">Support</a>
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

        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.03);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0.7;
          }
        }

        @keyframes heroReveal {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes statFade {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cardFade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-pulse {
          animation: pulse 4s ease-in-out infinite;
        }

        .animate-reveal {
          animation: heroReveal 0.8s ease-out;
        }

        .animate-stat-stagger {
          animation: statFade 0.7s ease-out;
        }

        .animate-card-stagger {
          animation: cardFade 0.7s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
