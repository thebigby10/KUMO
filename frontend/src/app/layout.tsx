import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KUMO – AI-Enhanced Coding Assessment",
  description:
    "A secure, AI-enhanced coding assessment platform that standardizes CS Labs with intelligent grading, real-time feedback, and plagiarism detection.",
  keywords: ["coding", "assessment", "AI", "education", "CS labs", "grading"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GOOGLE_CLIENT_ID =
    "514889526106-472odpbmjcc9qipsiodsitcqa74akuvf.apps.googleusercontent.com";
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        <GoogleOAuthProvider clientId={clientId}>
          <ToastProvider>
            {children}
          </ToastProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
