"use client";

import InitButton from "./InitButton";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/action-center", label: "ACTION CENTER" },
    { href: "/conversations", label: "CONVERSATIONS" },
    { href: "/analytics", label: "ANALYTICS" },
  ];

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-background text-tertiary flex flex-col z-10 border-r border-dashed border-border">
      {/* Header */}
      <div className="p-2 border-border border-dashed border-b flex justify-center">
        <Image
          src="/logo.png"
          alt="Drillbit Ops Logo"
          width={190}
          height={60}
          className="object-contain"
        />
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full text-center text-sm px-4 py-3 rounded-lg transition-colors block ${
                isActive
                  ? "bg-white text-black"
                  : "hover:bg-white hover:text-black"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Special Section for Database Actions */}
      <div className="p-4 border-t border-border border-dashed">
        <div className="mb-3">
          <span className="text-xs uppercase tracking-wide text-tertiary font-semibold">
            Database Actions
          </span>
        </div>
        <InitButton />
      </div>
    </nav>
  );
}
