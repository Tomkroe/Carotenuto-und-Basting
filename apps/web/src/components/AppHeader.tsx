"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, ClipboardList, FileSignature, LayoutDashboard, LogOut, Users } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { ThemeToggle } from "./ThemeToggle";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/objekte", label: "Objekte", icon: Building2 },
  { href: "/kontakte", label: "Kontakte", icon: Users },
  { href: "/vorgaenge", label: "Vorgänge", icon: ClipboardList },
  { href: "/mietvertraege", label: "Mietverträge", icon: FileSignature },
];

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleLogout() {
    await apiFetch("/auth/logout", { method: "POST" });
    queryClient.clear();
    router.replace("/login");
  }

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-3">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-lg font-semibold text-primary">
          maklerprogram
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-text-muted hover:bg-surface hover:text-text"
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-text-muted transition hover:border-primary hover:text-primary"
        >
          <LogOut size={15} />
          Abmelden
        </button>
      </div>
    </header>
  );
}
