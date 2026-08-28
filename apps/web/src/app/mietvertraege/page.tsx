"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, CheckCircle2, Archive, Plus, X } from "lucide-react";
import { MietvertragStatus } from "@maklerprogram/types";
import {
  useCurrentUser,
  useMietvertraege,
  useCreateMietvertrag,
  useEinheitenFlat,
  useKontakte,
} from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { AppHeader } from "@/components/AppHeader";

const STATUS_META: Record<MietvertragStatus, { label: string; icon: typeof CalendarClock; className: string }> = {
  [MietvertragStatus.GEPLANT]: {
    label: "Geplant",
    icon: CalendarClock,
    className: "bg-blue-500/10 text-blue-500",
  },
  [MietvertragStatus.AKTIV]: {
    label: "Aktiv",
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-500",
  },
  [MietvertragStatus.BEENDET]: {
    label: "Beendet",
    icon: Archive,
    className: "bg-text-muted/10 text-text-muted",
  },
};

function kontaktName(k: { vorname: string | null; nachname: string | null; firma: string | null }) {
  return [k.vorname, k.nachname].filter(Boolean).join(" ") || k.firma || "Unbenannt";
}

export default function MietvertraegePage() {
  const router = useRouter();
  const { isError: authError } = useCurrentUser();
  const { data: mietvertraege, isLoading } = useMietvertraege();
  const { data: einheiten } = useEinheitenFlat();
  const { data: kontakte } = useKontakte();
  const createMietvertrag = useCreateMietvertrag();

  const [showForm, setShowForm] = useState(false);
  const [einheitId, setEinheitId] = useState("");
  const [mieterId, setMieterId] = useState("");
  const [kaltmiete, setKaltmiete] = useState("");
  const [nebenkosten, setNebenkosten] = useState("");
  const [beginn, setBeginn] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authError) router.replace("/login");
  }, [authError, router]);

  const einheitenByObjekt = useMemo(() => {
    const groups = new Map<string, { objektName: string; einheiten: typeof einheiten }>();
    for (const e of einheiten ?? []) {
      if (!groups.has(e.objekt.id)) groups.set(e.objekt.id, { objektName: e.objekt.name, einheiten: [] });
      groups.get(e.objekt.id)!.einheiten!.push(e);
    }
    return Array.from(groups.values());
  }, [einheiten]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createMietvertrag.mutateAsync({
        einheitId,
        mieterId,
        kaltmiete: Number(kaltmiete),
        nebenkostenVorauszahlung: nebenkosten ? Number(nebenkosten) : undefined,
        beginn,
      });
      setEinheitId("");
      setMieterId("");
      setKaltmiete("");
      setNebenkosten("");
      setBeginn("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Mietvertrag konnte nicht angelegt werden.");
    }
  }

  return (
    <main className="min-h-screen bg-bg text-text">
      <AppHeader />

      <section className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Mietverträge</h1>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-fg transition hover:opacity-90"
          >
            {showForm ? (
              <>
                <X size={16} /> Abbrechen
              </>
            ) : (
              <>
                <Plus size={16} /> Neuer Mietvertrag
              </>
            )}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-lg border border-border bg-surface p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="einheitId">
                  Einheit
                </label>
                <select
                  id="einheitId"
                  required
                  value={einheitId}
                  onChange={(e) => setEinheitId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                >
                  <option value="" disabled>
                    Wählen…
                  </option>
                  {einheitenByObjekt.map((group) => (
                    <optgroup key={group.objektName} label={group.objektName}>
                      {group.einheiten!.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="mieterId">
                  Mieter
                </label>
                <select
                  id="mieterId"
                  required
                  value={mieterId}
                  onChange={(e) => setMieterId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                >
                  <option value="" disabled>
                    Wählen…
                  </option>
                  {kontakte?.map((k) => (
                    <option key={k.id} value={k.id}>
                      {kontaktName(k)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="kaltmiete">
                  Kaltmiete (€)
                </label>
                <input
                  id="kaltmiete"
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={kaltmiete}
                  onChange={(e) => setKaltmiete(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="nebenkosten">
                  Nebenkosten (€)
                </label>
                <input
                  id="nebenkosten"
                  type="number"
                  min={0}
                  step="0.01"
                  value={nebenkosten}
                  onChange={(e) => setNebenkosten(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="beginn">
                  Beginn
                </label>
                <input
                  id="beginn"
                  type="date"
                  required
                  value={beginn}
                  onChange={(e) => setBeginn(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={createMietvertrag.isPending}
              className="w-full rounded-lg bg-primary py-2 font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
            >
              {createMietvertrag.isPending ? "Wird angelegt…" : "Mietvertrag anlegen"}
            </button>
          </form>
        )}

        {isLoading && <p className="text-text-muted">Lädt…</p>}

        {mietvertraege && mietvertraege.length === 0 && !showForm && (
          <p className="text-text-muted">Noch keine Mietverträge angelegt.</p>
        )}

        {mietvertraege && mietvertraege.length > 0 && (
          <ul className="space-y-2">
            {mietvertraege.map((m) => {
              const meta = STATUS_META[m.status];
              const Icon = meta.icon;
              return (
                <li key={m.id}>
                  <Link
                    href={`/mietvertraege/${m.id}`}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 transition hover:border-primary"
                  >
                    <div>
                      <p className="font-medium">
                        {m.einheit.objekt.name} · {m.einheit.name}
                      </p>
                      <p className="mt-0.5 text-sm text-text-muted">
                        {kontaktName(m.mieter)} · {m.kaltmiete.toFixed(2)} € kalt
                      </p>
                    </div>
                    <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${meta.className}`}>
                      <Icon size={13} />
                      {meta.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
