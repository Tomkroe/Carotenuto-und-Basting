"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Zap, Flame, Droplet, Plus, X, Star } from "lucide-react";
import { ZaehlerTyp } from "@maklerprogram/types";
import { useCurrentUser, useZaehlerListe, useCreateZaehler, useObjekte, useEinheitenFlat } from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { SearchInput } from "@/components/SearchInput";
import { DataTable } from "@/components/DataTable";

const TYP_META: Record<ZaehlerTyp, { label: string; icon: typeof Zap; className: string }> = {
  [ZaehlerTyp.STROM]: { label: "Strom", icon: Zap, className: "bg-amber-500/10 text-amber-500" },
  [ZaehlerTyp.GAS]: { label: "Gas", icon: Flame, className: "bg-orange-500/10 text-orange-500" },
  [ZaehlerTyp.WASSER]: { label: "Wasser", icon: Droplet, className: "bg-blue-500/10 text-blue-500" },
};

export default function ZaehlerPage() {
  const router = useRouter();
  const { isError: authError } = useCurrentUser();
  const { data: zaehlerListe, isLoading } = useZaehlerListe();
  const { data: objekte } = useObjekte();
  const { data: einheiten } = useEinheitenFlat();
  const createZaehler = useCreateZaehler();

  const [showForm, setShowForm] = useState(false);
  const [typ, setTyp] = useState<ZaehlerTyp>(ZaehlerTyp.STROM);
  const [zaehlernummer, setZaehlernummer] = useState("");
  const [hauptzaehler, setHauptzaehler] = useState(true);
  const [versorger, setVersorger] = useState("");
  const [objektId, setObjektId] = useState("");
  const [einheitId, setEinheitId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (authError) router.replace("/login");
  }, [authError, router]);

  const gefilterteZaehler = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return zaehlerListe ?? [];
    return (zaehlerListe ?? []).filter((z) =>
      [z.zaehlernummer, z.versorger, z.objekt?.name, z.einheit?.name].filter(Boolean).some((f) => f!.toLowerCase().includes(query)),
    );
  }, [zaehlerListe, search]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createZaehler.mutateAsync({
        typ,
        zaehlernummer,
        hauptzaehler,
        versorger: versorger || undefined,
        objektId: objektId || undefined,
        einheitId: einheitId || undefined,
      });
      setZaehlernummer("");
      setHauptzaehler(true);
      setVersorger("");
      setObjektId("");
      setEinheitId("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Zähler konnte nicht angelegt werden.");
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Zähler</h1>
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
              <Plus size={16} /> Neuer Zähler
            </>
          )}
        </button>
      </div>

      <div className="mb-6">
        <StatCard value={zaehlerListe?.length ?? 0} label="Zähler" />
      </div>

      {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-lg border border-border bg-surface p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="typ">
                  Typ
                </label>
                <select
                  id="typ"
                  value={typ}
                  onChange={(e) => setTyp(e.target.value as ZaehlerTyp)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                >
                  {Object.values(ZaehlerTyp).map((t) => (
                    <option key={t} value={t}>
                      {TYP_META[t].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="zaehlernummer">
                  Zählernummer
                </label>
                <input
                  id="zaehlernummer"
                  type="text"
                  required
                  value={zaehlernummer}
                  onChange={(e) => setZaehlernummer(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
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
                  Einheit (optional)
                </label>
                <select
                  id="einheitId"
                  value={einheitId}
                  onChange={(e) => setEinheitId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                >
                  <option value="">–</option>
                  {einheiten?.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.objekt.name} · {e.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="versorger">
                Versorger (optional)
              </label>
              <input
                id="versorger"
                type="text"
                value={versorger}
                onChange={(e) => setVersorger(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-text-muted">
              <input
                type="checkbox"
                checked={hauptzaehler}
                onChange={(e) => setHauptzaehler(e.target.checked)}
                className="rounded border-border"
              />
              Hauptzähler
            </label>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={createZaehler.isPending}
              className="w-full rounded-lg bg-primary py-2 font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
            >
              {createZaehler.isPending ? "Wird angelegt…" : "Zähler anlegen"}
            </button>
          </form>
        )}

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Zähler durchsuchen…" />
      </div>

      {isLoading && <p className="text-text-muted">Lädt…</p>}

      {zaehlerListe && zaehlerListe.length === 0 && !showForm && (
        <p className="text-text-muted">Noch keine Zähler angelegt.</p>
      )}

      {gefilterteZaehler.length > 0 && (
        <DataTable
          columns={[
            { key: "nummer", header: "Zählernummer" },
            { key: "objekt", header: "Objekt/Einheit" },
            { key: "versorger", header: "Versorger" },
          ]}
        >
          {gefilterteZaehler.map((z) => {
            const meta = TYP_META[z.typ];
            const Icon = meta.icon;
            return (
              <tr
                key={z.id}
                onClick={() => router.push(`/zaehler/${z.id}`)}
                className="cursor-pointer transition hover:bg-bg"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full ${meta.className}`}>
                      <Icon size={15} />
                    </span>
                    <div>
                      <p className="flex items-center gap-1.5 font-medium">
                        {z.zaehlernummer}
                        {z.hauptzaehler && <Star size={13} className="text-amber-500" />}
                      </p>
                      <p className="text-xs text-text-muted">{meta.label}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {z.einheit && `${z.einheit.objekt.name} · ${z.einheit.name}`}
                  {!z.einheit && z.objekt && z.objekt.name}
                </td>
                <td className="px-4 py-3 text-text-muted">{z.versorger ?? "–"}</td>
              </tr>
            );
          })}
        </DataTable>
      )}
    </section>
  );
}
