"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavTab({
  href,
  children,
  labId,
}: {
  href: string;
  children: React.ReactNode;
  labId: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`relative px-6 py-3 text-sm font-medium rounded-lg transition-all ${
        isActive
          ? "text-pink-600 bg-pink-50"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      {children}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" />
      )}
    </Link>
  );
}