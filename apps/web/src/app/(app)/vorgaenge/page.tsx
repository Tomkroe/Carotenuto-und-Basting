"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CircleDot, Clock, CheckCircle2, Plus, X } from "lucide-react";
import { VorgangStatus } from "@maklerprogram/types";
import { useCurrentUser, useVorgaenge, useCreateVorgang, useObjekte, useKontakte, useUsers } from "@/lib/hooks";
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
  const { isError: authError } = useCurrentUser();
  const { data: vorgaenge, isLoading } = useVorgaenge();
  const { data: objekte } = useObjekte();
  const { data: kontakte } = useKontakte();
  const { data: users } = useUsers();
  const createVorgang = useCreateVorgang();

  const [showForm, setShowForm] = useState(false);
  const [titel, setTitel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [objektId, setObjektId] = useState("");
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

  const gefilterteVorgaenge = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return vorgaenge ?? [];
    return (vorgaenge ?? []).filter((v) =>
      [v.titel, v.objekt?.name, v.kontakt ? kontaktName(v.kontakt) : null]
        .filter(Boolean)
        .some((f) => f!.toLowerCase().includes(query)),
    );
  }, [vorgaenge, search]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createVorgang.mutateAsync({
        titel,
        beschreibung: beschreibung || undefined,
        objektId: objektId || undefined,
        kontaktId: kontaktId || undefined,
        verantwortlicherId: verantwortlicherId || undefined,
        faelligkeit: faelligkeit || undefined,
      });
      setTitel("");
      setBeschreibung("");
      setObjektId("");
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
            { key: "faelligkeit", header: "Fälligkeit" },
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
                <td className="px-4 py-3">
                  <p className="font-medium">{v.titel}</p>
                  {v.labels.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
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
                <td className="px-4 py-3 text-text-muted">
                  {v.objekt?.name}
                  {v.objekt && v.kontakt && " · "}
                  {v.kontakt && kontaktName(v.kontakt)}
                </td>
                <td className="px-4 py-3 text-text-muted">{v.verantwortlicher?.name ?? "–"}</td>
                <td className="px-4 py-3 text-text-muted">
                  {v.faelligkeit ? new Date(v.faelligkeit).toLocaleDateString("de-DE") : "–"}
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
