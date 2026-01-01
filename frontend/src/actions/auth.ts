"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

const AUTH_API_URL = "http://127.0.0.1:3001";

interface AuthResponse {
  error?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const res = await fetch(`${AUTH_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data: AuthResponse = await res.json();

    if (!res.ok) {
      return { error: data.error || "Login failed" };
    }

    if (data.token) {
      const cookieStore = await cookies();
      cookieStore.set("kumo_token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return { error: "Something went wrong. Please try again." };
  }
  
  redirect("/dashboard");
}

export async function signupAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const res = await fetch(`${AUTH_API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data: AuthResponse = await res.json();

    if (!res.ok) {
      if ((data as any).errors) return { error: "Invalid data provided" };
      return { error: data.error || "Signup failed" };
    }
    return { success: "Account created! Please log in." };

  } catch (error) {
    return { error: "Something went wrong." };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("kumo_token");
  redirect("/");
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("kumo_token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.decode(token) as { email: string; userId: string; name?: string } | null;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function googleLoginAction(googleIdToken: string) {
  try {
    const res = await fetch(`${AUTH_API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: googleIdToken }),
    });

    const data: AuthResponse = await res.json();

    if (!res.ok) {
      return { error: data.error || "Google login failed" };
    }

    if (data.token) {
      const cookieStore = await cookies();
      cookieStore.set("kumo_token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

  } catch (error) {
    return { error: "Connection to auth service failed" };
  }

  redirect("/dashboard");
}