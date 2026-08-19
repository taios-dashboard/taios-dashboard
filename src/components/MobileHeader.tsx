"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { appNavItems } from "@/data/navigation";

export default function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-200 bg-white lg:hidden">
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
          <Image
            src="/images/tobee-logo.jpg"
            alt="Tobee Empires logo"
            width={100}
            height={40}
            className="h-10 w-auto shrink-0 object-contain"
            priority
          />

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">
              TAIOS
            </p>
            <p className="truncate text-xs font-semibold text-gray-700">
              Tobee AI OS
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="shrink-0 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-800"
        >
          {isOpen ? "Close" : "Menu"}
        </button>
      </div>

      {isOpen && (
        <nav className="border-t border-gray-100 px-5 py-4">
          <div className="space-y-2">
            {appNavItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-red-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
