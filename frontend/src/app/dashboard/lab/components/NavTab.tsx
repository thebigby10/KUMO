// Client component to handle active state
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavTab({
  href,
  children,
}: {
  href: string;
  labId: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`px-6 py-3 text-sm font-medium hover:bg-gray-50 ${
        isActive
          ? "text-gray-900 border-b-4 border-blue-600"
          : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
}


export default NavTab;