"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MietvertragStatus, VorgangStatus } from "@maklerprogram/types";
import { useCurrentUser, useVorgaenge, useMietvertraege, useObjekte, useEinheitenFlat } from "@/lib/hooks";
import { StatCard } from "@/components/StatCard";

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useCurrentUser();
  const { data: vorgaenge } = useVorgaenge();
  const { data: mietvertraege } = useMietvertraege();
  const { data: objekte } = useObjekte();
  const { data: einheiten } = useEinheitenFlat();

  useEffect(() => {
    if (isError) router.replace("/login");
  }, [isError, router]);

  if (isLoading || !data) {
    return <div className="flex min-h-[50vh] items-center justify-center text-text-muted">Lädt…</div>;
  }

  const today = new Date().toISOString().slice(0, 10);
  const offeneVorgaenge = (vorgaenge ?? []).filter((v) => v.status !== VorgangStatus.ABGESCHLOSSEN);
  const ueberfaelligeVorgaenge = offeneVorgaenge.filter((v) => v.faelligkeit && v.faelligkeit.slice(0, 10) < today);
  const aktiveMietvertraege = (mietvertraege ?? []).filter((m) => m.status === MietvertragStatus.AKTIV);
  const mieteinnahmen = aktiveMietvertraege.reduce((sum, m) => sum + m.kaltmiete, 0);

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <p className="text-sm text-text-muted">{data.mandant.name}</p>
      <h1 className="mt-1 text-2xl font-semibold">Willkommen, {data.user.name}.</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard value={offeneVorgaenge.length} label="Offene Vorgänge" />
        <StatCard
          value={ueberfaelligeVorgaenge.length}
          label="Überfällige Vorgänge"
          tone={ueberfaelligeVorgaenge.length > 0 ? "danger" : "default"}
        />
        <StatCard value={aktiveMietvertraege.length} label="Aktive Mietverträge" tone="success" />
        <StatCard
          value={`${mieteinnahmen.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}
          label="Mieteinnahmen (Kaltmiete)"
        />
        <StatCard value={`${objekte?.length ?? 0} / ${einheiten?.length ?? 0}`} label="Objekte / Einheiten" />
      </div>
    </section>
  );
}
