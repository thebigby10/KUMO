"use client";

import { useActionState, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { loginAction, signupAction, googleLoginAction } from "../actions/auth";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [googleError, setGoogleError] = useState("");
  
  // React 19 / Next.js 15 form handling
  const [loginState, loginDispatch, isLoginPending] = useActionState(loginAction, { error: "" });
  const [signupState, signupDispatch, isSignupPending] = useActionState(signupAction, { error: "" });

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {isLogin ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-gray-500 mt-2">
          {isLogin ? "Enter your details to access your labs" : "Get started with Kumo today"}
        </p>
      </div>

      {/* --- GOOGLE LOGIN SECTION --- */}
      <div className="flex flex-col items-center gap-4">
        {googleError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg w-full text-center">
            {googleError}
          </div>
        )}
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            setGoogleError("");
            if (credentialResponse.credential) {
              const result = await googleLoginAction(credentialResponse.credential);
              if (result?.error) {
                setGoogleError(result.error);
              }
            }
          }}
          onError={() => {
            setGoogleError("Google Login Failed");
          }}
          theme="outline"
          size="large"
          width="350" // Adjusts to container width
          text={isLogin ? "signin_with" : "signup_with"}
        />

        <div className="relative flex items-center justify-center w-full">
          <div className="w-full border-t border-gray-200"></div>
          <span className="absolute px-3 text-xs text-gray-400 bg-white uppercase">
            Or continue with email
          </span>
        </div>
      </div>
      {/* ---------------------------- */}

      {isLogin ? (
        // LOGIN FORM
        <form action={loginDispatch} className="space-y-4">
          {loginState?.error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
              {loginState.error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input name="password" type="password" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" />
          </div>

          <button
            type="submit"
            disabled={isLoginPending}
            className="w-full py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoginPending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      ) : (
        // SIGNUP FORM
        <form action={signupDispatch} className="space-y-4">
          {signupState?.error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{signupState.error}</div>
          )}
          {signupState?.success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 rounded-lg">
              {signupState.success} 
              <button type="button" onClick={() => setIsLogin(true)} className="ml-1 underline">Login now</button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input name="name" type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input name="password" type="password" required minLength={8} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Min 8 chars" />
          </div>

          <button
            type="submit"
            disabled={isSignupPending}
            className="w-full py-2.5 text-white bg-green-600 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSignupPending ? "Creating account..." : "Create Account"}
          </button>
        </form>
      )}

      {/* Toggle Switch */}
      <div className="text-center text-sm text-gray-600">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-600 font-medium hover:underline"
        >
          {isLogin ? "Sign up" : "Log in"}
        </button>
      </div>
    </div>
  );
}