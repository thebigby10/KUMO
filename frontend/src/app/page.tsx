import AuthForm from "./components/AuthForm";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      {/* Logo Area */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-blue-200 shadow-lg">
          <span className="text-2xl font-bold text-white">K</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Kumo</h1>
        <p className="text-gray-500 mt-2">AI-Enhanced Coding Assessment Platform</p>
      </div>

      {/* The Auth Component */}
      <AuthForm />
      
      <p className="mt-8 text-xs text-gray-400">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}