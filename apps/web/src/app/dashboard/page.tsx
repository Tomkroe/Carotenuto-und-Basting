"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, ClipboardList, FileSignature, Gauge, KeyRound, Receipt, Users } from "lucide-react";
import { useCurrentUser } from "@/lib/hooks";
import { AppHeader } from "@/components/AppHeader";

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (isError) router.replace("/login");
  }, [isError, router]);

  if (isLoading || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg text-text-muted">
        Lädt…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg text-text">
      <AppHeader />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm text-text-muted">{data.mandant.name}</p>
        <h1 className="mt-1 text-2xl font-semibold">Willkommen, {data.user.name}.</h1>
        <p className="mt-4 max-w-xl text-text-muted">
          Dies ist das Grundgerüst deiner Hausverwaltung. Weitere Module folgen in den nächsten
          Ausbaustufen.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-4 sm:max-w-2xl sm:grid-cols-4">
          <Link
            href="/objekte"
            className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 transition hover:border-primary"
          >
            <Building2 className="text-primary" size={20} />
            <span className="font-medium">Objekte</span>
          </Link>
          <Link
            href="/kontakte"
            className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 transition hover:border-primary"
          >
            <Users className="text-primary" size={20} />
            <span className="font-medium">Kontakte</span>
          </Link>
          <Link
            href="/vorgaenge"
            className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 transition hover:border-primary"
          >
            <ClipboardList className="text-primary" size={20} />
            <span className="font-medium">Vorgänge</span>
          </Link>
          <Link
            href="/mietvertraege"
            className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 transition hover:border-primary"
          >
            <FileSignature className="text-primary" size={20} />
            <span className="font-medium">Mietverträge</span>
          </Link>
          <Link
            href="/eigentuemerschaften"
            className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 transition hover:border-primary"
          >
            <KeyRound className="text-primary" size={20} />
            <span className="font-medium">Eigentümer</span>
          </Link>
          <Link
            href="/zaehler"
            className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 transition hover:border-primary"
          >
            <Gauge className="text-primary" size={20} />
            <span className="font-medium">Zähler</span>
          </Link>
          <Link
            href="/nebenkostenabrechnungen"
            className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 transition hover:border-primary"
          >
            <Receipt className="text-primary" size={20} />
            <span className="font-medium">Nebenkosten</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
