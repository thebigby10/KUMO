"use client";

import Link from "next/link";

interface GradeButtonProps {
  href: string;
}

export default function GradeButton({ href }: GradeButtonProps) {
  return (
    <Link
      href={href}
      onClick={(e) => e.stopPropagation()} // Safe to use here in a Client Component
      className="hidden sm:flex text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 hover:bg-blue-100 transition"
    >
      Grade
    </Link>
  );
}
