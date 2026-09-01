"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { MietvertragStatus, VorgangStatus } from "@maklerprogram/types";
import {
  useCurrentUser,
  useVorgaenge,
  useMietvertraege,
  useObjekte,
  useEinheitenFlat,
  useNebenkostenabrechnungen,
  useAllNebenkostenPositionen,
  useAllTodos,
} from "@/lib/hooks";
import { StatCard } from "@/components/StatCard";
import { ProgressRing } from "@/components/ProgressRing";
import { CashflowChart, type CashflowMonth } from "@/components/CashflowChart";

const MONTH_LABEL = new Intl.DateTimeFormat("de-DE", { month: "short" });

function buildCashflow(
  mietvertraege: { kaltmiete: number; beginn: string; ende: string | null }[],
  abrechnungen: { zeitraumVon: string }[],
  positionenByAbrechnung: Map<string, number>,
  abrechnungIds: string[],
): CashflowMonth[] {
  const now = new Date();
  const months: { start: Date; end: Date; label: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    months.push({ start, end, label: MONTH_LABEL.format(start) });
  }

  return months.map(({ start, end, label }) => {
    const einnahmen = mietvertraege
      .filter((m) => {
        const beginn = new Date(m.beginn);
        const ende = m.ende ? new Date(m.ende) : null;
        return beginn <= end && (!ende || ende >= start);
      })
      .reduce((sum, m) => sum + m.kaltmiete, 0);

    const ausgaben = abrechnungen.reduce((sum, a, i) => {
      const von = new Date(a.zeitraumVon);
      if (von.getFullYear() !== start.getFullYear() || von.getMonth() !== start.getMonth()) return sum;
      return sum + (positionenByAbrechnung.get(abrechnungIds[i]) ?? 0);
    }, 0);

    return { month: label, einnahmen, ausgaben, ueberschuss: einnahmen - ausgaben };
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useCurrentUser();
  const { data: vorgaenge } = useVorgaenge();
  const { data: mietvertraege } = useMietvertraege();
  const { data: objekte } = useObjekte();
  const { data: einheiten } = useEinheitenFlat();
  const { data: abrechnungen } = useNebenkostenabrechnungen();
  const positionenResults = useAllNebenkostenPositionen(abrechnungen);
  const { data: todos } = useAllTodos();

  useEffect(() => {
    if (isError) router.replace("/login");
  }, [isError, router]);

  const positionenByAbrechnung = new Map<string, number>();
  (abrechnungen ?? []).forEach((a, i) => {
    const total = (positionenResults[i]?.data ?? []).reduce((sum, p) => sum + p.betrag, 0);
    positionenByAbrechnung.set(a.id, total);
  });

  const cashflow = buildCashflow(
    mietvertraege ?? [],
    abrechnungen ?? [],
    positionenByAbrechnung,
    (abrechnungen ?? []).map((a) => a.id),
  );

  if (isLoading || !data) {
    return <div className="flex min-h-[50vh] items-center justify-center text-text-muted">Lädt…</div>;
  }

  const today = new Date().toISOString().slice(0, 10);
  const offeneVorgaenge = (vorgaenge ?? []).filter((v) => v.status !== VorgangStatus.ABGESCHLOSSEN);
  const ueberfaelligeVorgaenge = offeneVorgaenge.filter((v) => v.faelligkeit && v.faelligkeit.slice(0, 10) < today);
  const nichtZugewiesen = offeneVorgaenge.filter((v) => !v.verantwortlicher);
  const meineVorgaenge = offeneVorgaenge.filter((v) => v.verantwortlicher?.id === data.user.id);
  const meineUeberfaellig = meineVorgaenge.filter((v) => v.faelligkeit && v.faelligkeit.slice(0, 10) < today);
  const meineHeuteFaellig = meineVorgaenge.filter((v) => v.faelligkeit && v.faelligkeit.slice(0, 10) === today);

  const offeneTodosByVorgang = new Map<string, number>();
  for (const t of todos ?? []) {
    if (t.erledigt) continue;
    offeneTodosByVorgang.set(t.vorgang.id, (offeneTodosByVorgang.get(t.vorgang.id) ?? 0) + 1);
  }
  const sumTodos = (vs: { id: string }[]) => vs.reduce((sum, v) => sum + (offeneTodosByVorgang.get(v.id) ?? 0), 0);

  const aktiveMietvertraege = (mietvertraege ?? []).filter((m) => m.status === MietvertragStatus.AKTIV);
  const mieteinnahmen = aktiveMietvertraege.reduce((sum, m) => sum + m.kaltmiete, 0);
  const vermieteteEinheitIds = new Set(aktiveMietvertraege.map((m) => m.einheit.id));
  const einheitenGesamt = einheiten?.length ?? 0;
  const einheitenVermietetPercent = einheitenGesamt > 0 ? (vermieteteEinheitIds.size / einheitenGesamt) * 100 : 0;

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-text-muted">{data.mandant.name}</p>
          <h1 className="mt-1 text-2xl font-semibold">Willkommen, {data.user.name}.</h1>
        </div>
      </div>

      <button
        onClick={() => router.push("/vorgaenge?neu=1")}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-medium text-primary-fg transition hover:opacity-90"
      >
        <Plus size={18} />
        Vorgang anlegen
      </button>

      <h2 className="mb-3 mt-6 text-sm font-semibold text-text-muted">Deine Objekte im Überblick</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          value={`${mieteinnahmen.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}
          label="Mieteinnahmen (aktive Verträge)"
        />
        <StatCard
          value={aktiveMietvertraege.length}
          label="Aktive Mietverträge"
          tone="success"
          onClick={() => router.push("/mietvertraege")}
        />
        <ProgressRing
          percent={einheitenVermietetPercent}
          value={`${vermieteteEinheitIds.size}/${einheitenGesamt}`}
          label="Einheiten vermietet"
          caption={`${objekte?.length ?? 0} Objekte`}
        />
      </div>

      <h2 className="mb-3 mt-6 text-sm font-semibold text-text-muted">Alle Vorgänge</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          value={offeneVorgaenge.length}
          label="Offen"
          primaryLabel="Vorgänge"
          secondaryValue={sumTodos(offeneVorgaenge)}
          secondaryLabel="To-Do"
          onClick={() => router.push("/vorgaenge?filter=offen")}
        />
        <StatCard
          value={ueberfaelligeVorgaenge.length}
          label="Überfällig"
          tone={ueberfaelligeVorgaenge.length > 0 ? "danger" : "default"}
          primaryLabel="Vorgänge"
          secondaryValue={sumTodos(ueberfaelligeVorgaenge)}
          secondaryLabel="To-Do"
          onClick={() => router.push("/vorgaenge?filter=ueberfaellig")}
        />
        <StatCard
          value={nichtZugewiesen.length}
          label="Nicht zugewiesen"
          tone={nichtZugewiesen.length > 0 ? "warning" : "default"}
          primaryLabel="Vorgänge"
          secondaryValue={sumTodos(nichtZugewiesen)}
          secondaryLabel="To-Do"
          onClick={() => router.push("/vorgaenge?filter=nicht-zugewiesen")}
        />
      </div>

      <h2 className="mb-3 mt-6 text-sm font-semibold text-text-muted">Meine Vorgänge</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          value={meineVorgaenge.length}
          label="Offen"
          primaryLabel="Vorgänge"
          secondaryValue={sumTodos(meineVorgaenge)}
          secondaryLabel="To-Do"
          onClick={() => router.push("/vorgaenge?filter=meine-offen")}
        />
        <StatCard
          value={meineUeberfaellig.length}
          label="Überfällig"
          tone={meineUeberfaellig.length > 0 ? "danger" : "default"}
          primaryLabel="Vorgänge"
          secondaryValue={sumTodos(meineUeberfaellig)}
          secondaryLabel="To-Do"
          onClick={() => router.push("/vorgaenge?filter=meine-ueberfaellig")}
        />
        <StatCard
          value={meineHeuteFaellig.length}
          label="Heute fällig"
          tone={meineHeuteFaellig.length > 0 ? "warning" : "default"}
          primaryLabel="Vorgänge"
          secondaryValue={sumTodos(meineHeuteFaellig)}
          secondaryLabel="To-Do"
          onClick={() => router.push("/vorgaenge?filter=meine-heute")}
        />
      </div>

      <div className="mt-6">
        <CashflowChart data={cashflow} />
      </div>
    </section>
  );
}
