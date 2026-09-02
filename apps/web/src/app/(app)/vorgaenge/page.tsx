"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, CircleDot, Clock, CheckCircle2, Flag, Plus, X } from "lucide-react";
import { VorgangStatus } from "@maklerprogram/types";
import { useCurrentUser, useVorgaenge, useCreateVorgang, useObjekte, useKontakte, useUsers, useEinheitenFlat } from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { SearchInput } from "@/components/SearchInput";
import { DataTable } from "@/components/DataTable";

const STATUS_META: Record<VorgangStatus, { label: string; icon: typeof CircleDot; className: string }> = {
  [VorgangStatus.OFFEN]: { label: "Offen", icon: CircleDot, className: "bg-blue-500/10 text-blue-500" },
  [VorgangStatus.IN_BEARBEITUNG]: {
    label: "In Bearbeitung",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-500",
  },
  [VorgangStatus.ABGESCHLOSSEN]: {
    label: "Abgeschlossen",
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-500",
  },
};

function kontaktName(k: { vorname: string | null; nachname: string | null; firma: string | null }) {
  return [k.vorname, k.nachname].filter(Boolean).join(" ") || k.firma || "Unbenannt";
}

export default function VorgaengePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");
  const { data: me, isError: authError } = useCurrentUser();
  const { data: vorgaenge, isLoading } = useVorgaenge();
  const { data: objekte } = useObjekte();
  const { data: kontakte } = useKontakte();
  const { data: users } = useUsers();
  const { data: einheiten } = useEinheitenFlat();
  const createVorgang = useCreateVorgang();

  const [showForm, setShowForm] = useState(searchParams.get("neu") === "1");
  const [titel, setTitel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [objektId, setObjektId] = useState("");
  const [einheitId, setEinheitId] = useState("");
  const [kontaktId, setKontaktId] = useState("");
  const [verantwortlicherId, setVerantwortlicherId] = useState("");
  const [faelligkeit, setFaelligkeit] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (authError) router.replace("/login");
  }, [authError, router]);

  const today = new Date().toISOString().slice(0, 10);
  const offen = (vorgaenge ?? []).filter((v) => v.status !== VorgangStatus.ABGESCHLOSSEN);
  const ueberfaellig = offen.filter((v) => v.faelligkeit && v.faelligkeit.slice(0, 10) < today);

  const FILTER_LABEL: Record<string, string> = {
    offen: "Offene Vorgänge",
    ueberfaellig: "Überfällige Vorgänge",
    "nicht-zugewiesen": "Nicht zugewiesene Vorgänge",
    "meine-offen": "Meine offenen Vorgänge",
    "meine-ueberfaellig": "Meine überfälligen Vorgänge",
    "meine-heute": "Heute fällige Vorgänge",
  };

  const gefilterteVorgaenge = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (vorgaenge ?? [])
      .filter((v) => {
        switch (filter) {
          case "offen":
            return v.status !== VorgangStatus.ABGESCHLOSSEN;
          case "ueberfaellig":
            return v.status !== VorgangStatus.ABGESCHLOSSEN && v.faelligkeit && v.faelligkeit.slice(0, 10) < today;
          case "nicht-zugewiesen":
            return v.status !== VorgangStatus.ABGESCHLOSSEN && !v.verantwortlicher;
          case "meine-offen":
            return v.status !== VorgangStatus.ABGESCHLOSSEN && v.verantwortlicher?.id === me?.user.id;
          case "meine-ueberfaellig":
            return (
              v.status !== VorgangStatus.ABGESCHLOSSEN &&
              v.verantwortlicher?.id === me?.user.id &&
              v.faelligkeit &&
              v.faelligkeit.slice(0, 10) < today
            );
          case "meine-heute":
            return (
              v.status !== VorgangStatus.ABGESCHLOSSEN &&
              v.verantwortlicher?.id === me?.user.id &&
              v.faelligkeit &&
              v.faelligkeit.slice(0, 10) === today
            );
          default:
            return true;
        }
      })
      .filter(
        (v) =>
          !query ||
          [v.titel, v.objekt?.name, v.kontakt ? kontaktName(v.kontakt) : null]
            .filter(Boolean)
            .some((f) => f!.toLowerCase().includes(query)),
      );
  }, [vorgaenge, search, filter, me, today]);

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
      await createVorgang.mutateAsync({
        titel,
        beschreibung: beschreibung || undefined,
        objektId: objektId || undefined,
        einheitId: einheitId || undefined,
        kontaktId: kontaktId || undefined,
        verantwortlicherId: verantwortlicherId || undefined,
        faelligkeit: faelligkeit || undefined,
      });
      setTitel("");
      setBeschreibung("");
      setObjektId("");
      setEinheitId("");
      setKontaktId("");
      setVerantwortlicherId("");
      setFaelligkeit("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Vorgang konnte nicht angelegt werden.");
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Vorgänge</h1>
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
              <Plus size={16} /> Neuer Vorgang
            </>
          )}
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-2">
        <StatCard value={offen.length} label="Offene Vorgänge" />
        <StatCard value={ueberfaellig.length} label="Überfällige Vorgänge" tone={ueberfaellig.length > 0 ? "danger" : "default"} />
      </div>

      {filter && FILTER_LABEL[filter] && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
          <span>Gefiltert: {FILTER_LABEL[filter]}</span>
          <button onClick={() => router.push("/vorgaenge")} className="ml-auto text-xs underline hover:opacity-80">
            Filter zurücksetzen
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-lg border border-border bg-surface p-4">
          <div>
            <label className="mb-1 block text-sm text-text-muted" htmlFor="titel">
              Titel
            </label>
            <input
              id="titel"
              type="text"
              required
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted" htmlFor="beschreibung">
              Beschreibung (optional)
            </label>
            <textarea
              id="beschreibung"
              rows={3}
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="objektId">
                Objekt (optional)
              </label>
              <select
                id="objektId"
                value={objektId}
                onChange={(e) => setObjektId(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              >
                <option value="">–</option>
                {objekte?.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="einheitId">
                Wohnung/Einheit (optional)
              </label>
              <select
                id="einheitId"
                value={einheitId}
                onChange={(e) => setEinheitId(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              >
                <option value="">–</option>
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
              <label className="mb-1 block text-sm text-text-muted" htmlFor="kontaktId">
                Kontakt (optional)
              </label>
              <select
                id="kontaktId"
                value={kontaktId}
                onChange={(e) => setKontaktId(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              >
                <option value="">–</option>
                {kontakte?.map((k) => (
                  <option key={k.id} value={k.id}>
                    {kontaktName(k)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted" htmlFor="verantwortlicherId">
              Verantwortlich (optional)
            </label>
            <select
              id="verantwortlicherId"
              value={verantwortlicherId}
              onChange={(e) => setVerantwortlicherId(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
            >
              <option value="">–</option>
              {users?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted" htmlFor="faelligkeit">
              Fälligkeit (optional)
            </label>
            <input
              id="faelligkeit"
              type="date"
              value={faelligkeit}
              onChange={(e) => setFaelligkeit(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={createVorgang.isPending}
            className="w-full rounded-lg bg-primary py-2 font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
          >
            {createVorgang.isPending ? "Wird angelegt…" : "Vorgang anlegen"}
          </button>
        </form>
      )}

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Vorgänge durchsuchen…" />
      </div>

      {isLoading && <p className="text-text-muted">Lädt…</p>}

      {vorgaenge && vorgaenge.length === 0 && !showForm && (
        <p className="text-text-muted">Noch keine Vorgänge angelegt.</p>
      )}

      {gefilterteVorgaenge.length > 0 && (
        <DataTable
          columns={[
            { key: "nr", header: "Nr." },
            { key: "titel", header: "Titel" },
            { key: "objekt", header: "Objekt/Kontakt" },
            { key: "verantwortlicher", header: "Verantwortlich" },
            { key: "erstellt", header: "Erstellt" },
            { key: "faelligkeit", header: "Fälligkeit" },
            { key: "labels", header: "Labels" },
            { key: "status", header: "Status" },
          ]}
        >
          {gefilterteVorgaenge.map((v) => {
            const meta = STATUS_META[v.status];
            const Icon = meta.icon;
            return (
              <tr
                key={v.id}
                onClick={() => router.push(`/vorgaenge/${v.id}`)}
                className="cursor-pointer transition hover:bg-bg"
              >
                <td className="px-4 py-3 text-text-muted">#{v.nummer}</td>
                <td className="px-4 py-3 font-medium">{v.titel}</td>
                <td className="px-4 py-3 text-text-muted">
                  {v.objekt?.name}
                  {v.objekt && v.kontakt && " · "}
                  {v.kontakt && kontaktName(v.kontakt)}
                </td>
                <td className="px-4 py-3 text-text-muted">{v.verantwortlicher?.name ?? "–"}</td>
                <td className="px-4 py-3 text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={13} />
                    {new Date(v.createdAt).toLocaleDateString("de-DE")}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {v.faelligkeit ? (
                    <span className="flex items-center gap-1.5">
                      <Flag size={13} />
                      {new Date(v.faelligkeit).toLocaleDateString("de-DE")}
                    </span>
                  ) : (
                    "–"
                  )}
                </td>
                <td className="px-4 py-3">
                  {v.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {v.labels.map((l) => (
                        <span
                          key={l.id}
                          className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                          style={{ backgroundColor: l.farbe }}
                        >
                          {l.name}
                        </span>
                      ))}
                    </div>
                  )}
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
