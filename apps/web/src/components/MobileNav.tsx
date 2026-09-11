"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { SidebarNavContent } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Menü öffnen"
          className="text-text-muted transition hover:text-text"
        >
          <Menu size={22} />
        </button>
        <Link href="/dashboard" className="text-base font-semibold text-primary">
          maklerprogram
        </Link>
        <ThemeToggle />
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col border-r border-border bg-surface md:hidden">
            <div className="flex items-center justify-end px-4 py-3">
              <button
                onClick={() => setOpen(false)}
                aria-label="Menü schließen"
                className="text-text-muted transition hover:text-text"
              >
                <X size={20} />
              </button>
            </div>
            <SidebarNavContent onNavigate={() => setOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
