"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Leads",
    href: "/leads",
  },
  {
    label: "Properties",
    href: "/properties",
  },
  {
    label: "Inspections",
    href: "/inspections",
  },
  {
    label: "Content Generator",
    href: "/content-generator",
  },
  {
    label: "Ads Generator",
    href: "/ads-generator",
  },
  {
    label: "Reports",
    href: "/reports",
  },
  {
    label: "Settings",
    href: "/settings",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-72 flex-col overflow-y-auto bg-black px-6 py-6 text-white lg:flex">
      <div className="mb-8 rounded-2xl bg-white p-3">
        <Image
          src="/images/tobee-logo.jpg"
          alt="Tobee Empires logo"
          width={150}
          height={60}
          className="mx-auto h-24 w-auto object-contain"
          priority
        />
      </div>

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">
          TAIOS
        </p>
        <h1 className="mt-2 text-2xl font-bold">Tobee AI OS</h1>
        <p className="mt-2 text-sm text-gray-400">
          AI-powered real estate operating system.
        </p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                isActive
                  ? "bg-red-600 text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-semibold">AI Status</p>
        <p className="mt-1 text-xs text-gray-400">
          Lead scoring, content support, and reporting are active in prototype
          mode.
        </p>
      </div>
    </aside>
  );
}
