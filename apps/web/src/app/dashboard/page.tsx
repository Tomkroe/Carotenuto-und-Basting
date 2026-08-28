"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/lib/hooks";
import { apiFetch } from "@/lib/api";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (isError) router.replace("/login");
  }, [isError, router]);

  async function handleLogout() {
    await apiFetch("/auth/logout", { method: "POST" });
    queryClient.clear();
    router.replace("/login");
  }

  if (isLoading || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg text-text-muted">
        Lädt…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg text-text">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <span className="text-lg font-semibold text-primary">maklerprogram</span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="rounded-full border border-border px-3 py-1.5 text-sm text-text-muted transition hover:border-primary hover:text-primary"
          >
            Abmelden
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm text-text-muted">{data.mandant.name}</p>
        <h1 className="mt-1 text-2xl font-semibold">Willkommen, {data.user.name}.</h1>
        <p className="mt-4 max-w-xl text-text-muted">
          Dies ist das Grundgerüst deiner Hausverwaltung. Objekte, Vorgänge, Mietverträge und die
          weiteren Module folgen in den nächsten Ausbaustufen.
        </p>
      </section>
    </main>
  );
}
