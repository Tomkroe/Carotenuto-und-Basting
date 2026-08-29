"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CheckCircle2, Archive, CircleDashed, Plus, X } from "lucide-react";
import { MietvertragStatus } from "@maklerprogram/types";
import {
  useCurrentUser,
  useMietvertraege,
  useCreateMietvertrag,
  useEinheitenFlat,
  useKontakte,
} from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { SearchInput } from "@/components/SearchInput";
import { DataTable } from "@/components/DataTable";

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
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (authError) router.replace("/login");
  }, [authError, router]);

  const today = new Date().toISOString().slice(0, 10);

  const einheitenMitStatus = useMemo(() => {
    return (einheiten ?? []).map((e) => {
      const aktuellerVertrag = (mietvertraege ?? []).find(
        (m) => m.einheit.id === e.id && m.beginn.slice(0, 10) <= today && (!m.ende || m.ende.slice(0, 10) >= today),
      );
      return { einheit: e, mietvertrag: aktuellerVertrag ?? null };
    });
  }, [einheiten, mietvertraege, today]);

  const vermietet = einheitenMitStatus.filter((r) => r.mietvertrag);
  const leerstehend = einheitenMitStatus.filter((r) => !r.mietvertrag);

  const gefilterteEinheiten = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return einheitenMitStatus;
    return einheitenMitStatus.filter((r) =>
      [r.einheit.objekt.name, r.einheit.name, r.mietvertrag ? kontaktName(r.mietvertrag.mieter) : null]
        .filter(Boolean)
        .some((f) => f!.toLowerCase().includes(query)),
    );
  }, [einheitenMitStatus, search]);

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
    <section className="mx-auto max-w-5xl px-6 py-10">
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

      <div className="mb-6 grid grid-cols-3 gap-4">
        <StatCard value={einheitenMitStatus.length} label="Alle Einheiten" />
        <StatCard value={vermietet.length} label="Vermietet" tone="success" />
        <StatCard value={leerstehend.length} label="Leerstehend" tone={leerstehend.length > 0 ? "warning" : "default"} />
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

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Mietverträge durchsuchen…" />
      </div>

      {isLoading && <p className="text-text-muted">Lädt…</p>}

      {einheiten && einheiten.length === 0 && !showForm && (
        <p className="text-text-muted">Noch keine Einheiten angelegt.</p>
      )}

      {gefilterteEinheiten.length > 0 && (
        <DataTable
          columns={[
            { key: "objekt", header: "Objekt" },
            { key: "einheit", header: "Einheit" },
            { key: "mieter", header: "Mieter" },
            { key: "miete", header: "Kaltmiete" },
            { key: "status", header: "Mietstatus" },
          ]}
        >
          {gefilterteEinheiten.map(({ einheit, mietvertrag }) => {
            const meta = mietvertrag
              ? STATUS_META[MietvertragStatus.AKTIV]
              : { label: "Leerstand", icon: CircleDashed, className: "bg-amber-500/10 text-amber-500" };
            const Icon = meta.icon;
            return (
              <tr
                key={einheit.id}
                onClick={() => mietvertrag && router.push(`/mietvertraege/${mietvertrag.id}`)}
                className={mietvertrag ? "cursor-pointer transition hover:bg-bg" : "transition hover:bg-bg"}
              >
                <td className="px-4 py-3 text-text-muted">{einheit.objekt.name}</td>
                <td className="px-4 py-3 font-medium">{einheit.name}</td>
                <td className="px-4 py-3 text-text-muted">
                  {mietvertrag ? kontaktName(mietvertrag.mieter) : "–"}
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {mietvertrag ? `${mietvertrag.kaltmiete.toFixed(2)} €` : "–"}
                </td>
                <td className="px-4 py-3">
                  <span className={`flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${meta.className}`}>
                    <Icon size={13} />
                    {meta.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </DataTable>
      )}
    </section>
  );
}
