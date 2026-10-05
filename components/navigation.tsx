"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/import", label: "Import" },
  { href: "/forms", label: "Formularze" },
  { href: "/builder", label: "Builder" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-lg font-bold text-gray-900">
          OpenAPI Form Builder
        </Link>
        <div className="flex gap-4">
          {links.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
