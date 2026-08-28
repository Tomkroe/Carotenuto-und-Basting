"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  ClipboardList,
  FileSignature,
  Gauge,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Plus,
  Receipt,
  Users,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCurrentUser } from "@/lib/hooks";
import { ThemeToggle } from "./ThemeToggle";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/objekte", label: "Objekte", icon: Building2 },
  { href: "/kontakte", label: "Kontakte", icon: Users },
  { href: "/vorgaenge", label: "Vorgänge", icon: ClipboardList },
  { href: "/mietvertraege", label: "Mietverträge", icon: FileSignature },
  { href: "/eigentuemerschaften", label: "Eigentümer", icon: KeyRound },
  { href: "/zaehler", label: "Zähler", icon: Gauge },
  { href: "/nebenkostenabrechnungen", label: "Nebenkosten", icon: Receipt },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: me } = useCurrentUser();

  async function handleLogout() {
    await apiFetch("/auth/logout", { method: "POST" });
    queryClient.clear();
    router.replace("/login");
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface">
      <div className="flex items-center justify-between px-5 py-4">
        <Link href="/dashboard" className="text-lg font-semibold text-primary">
          maklerprogram
        </Link>
        <ThemeToggle />
      </div>

      <div className="px-4 pb-3">
        <Link
          href="/vorgaenge"
          className="flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-sm font-medium text-primary-fg transition hover:opacity-90"
        >
          <Plus size={16} />
          Vorgang erstellen
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-text-muted hover:bg-bg hover:text-text"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-4 py-3">
        <div className="mb-2 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            {me?.user.name?.[0]?.toUpperCase() ?? "?"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{me?.user.name ?? "…"}</p>
            <p className="truncate text-xs text-text-muted">{me?.mandant.name ?? ""}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-text-muted transition hover:bg-bg hover:text-text"
        >
          <LogOut size={15} />
          Abmelden
        </button>
      </div>
    </aside>
  );
}
