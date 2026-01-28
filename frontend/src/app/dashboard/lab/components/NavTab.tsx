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
          ? "text-blue-400 bg-blue-500/10"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
      }`}
    >
      {children}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
      )}
    </Link>
  );
}