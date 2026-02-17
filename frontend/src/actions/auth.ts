"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { OAuth2Client } from "google-auth-library";
import prisma from "@/lib/prisma";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function issueToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" },
  );
}

async function setTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("kumo_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { error: "Invalid credentials" };
    }

    if (!user.password) {
      return { error: "Please log in with Google" };
    }

    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return { error: "Invalid credentials" };
    }

    const token = issueToken(user.id, user.email);
    await setTokenCookie(token);
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

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "User already exists" };
    }

    const hashedPassword = await argon2.hash(password);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || undefined,
      },
    });

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string;
      userId: string;
      name?: string;
    };
    return decoded;
  } catch {
    return null;
  }
}

export async function googleLoginAction(googleIdToken: string) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: googleIdToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return { error: "Invalid Google token" };
    }

    const { email, name, sub, picture, email_verified } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || "Google User",
          password: null,
          googleId: sub,
          provider: "google",
          avatar: picture,
          isEmailVerified: email_verified === true,
        },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: sub,
          avatar: user.avatar || picture,
          isEmailVerified: user.isEmailVerified || email_verified === true,
        },
      });
    }

    const token = issueToken(user.id, user.email);
    await setTokenCookie(token);
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return { error: "Google authentication failed" };
  }

  redirect("/dashboard");
}