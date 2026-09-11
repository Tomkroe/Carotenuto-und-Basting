"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Zap, Flame, Droplet, Download, Fuel, Plus, Star, Gauge, TrendingUp } from "lucide-react";
import { ZaehlerTyp } from "@maklerprogram/types";
import {
  useCurrentUser,
  useZaehlerListe,
  useCreateZaehler,
  useObjekte,
  useEinheitenFlat,
  useAllZaehlerstaende,
} from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { downloadCsv } from "@/lib/csvExport";
import { StatCard } from "@/components/StatCard";
import { SearchInput } from "@/components/SearchInput";
import { DataTable } from "@/components/DataTable";
import { MobileCardList } from "@/components/MobileCardList";
import { Modal } from "@/components/Modal";

const TYP_META: Record<ZaehlerTyp, { label: string; icon: typeof Zap; className: string; einheit: string }> = {
  [ZaehlerTyp.STROM]: { label: "Strom", icon: Zap, className: "bg-amber-500/10 text-amber-500", einheit: "kWh" },
  [ZaehlerTyp.GAS]: { label: "Gas", icon: Flame, className: "bg-orange-500/10 text-orange-500", einheit: "m³" },
  [ZaehlerTyp.WASSER]: { label: "Wasser", icon: Droplet, className: "bg-blue-500/10 text-blue-500", einheit: "m³" },
  [ZaehlerTyp.OEL]: { label: "Öl", icon: Fuel, className: "bg-stone-500/10 text-stone-500", einheit: "L" },
};

export default function ZaehlerPage() {
  const router = useRouter();
  const { isError: authError } = useCurrentUser();
  const { data: zaehlerListe, isLoading } = useZaehlerListe();
  const { data: objekte } = useObjekte();
  const { data: einheiten } = useEinheitenFlat();
  const createZaehler = useCreateZaehler();
  const zaehlerstaendeResults = useAllZaehlerstaende(zaehlerListe);

  const standByZaehler = new Map<string, { letzter: number; datum: string; verbrauch: number | null } | null>();
  (zaehlerListe ?? []).forEach((z, i) => {
    const staende = zaehlerstaendeResults[i]?.data ?? [];
    if (staende.length === 0) {
      standByZaehler.set(z.id, null);
      return;
    }
    const [letzter, vorheriger] = staende;
    standByZaehler.set(z.id, {
      letzter: letzter.wert,
      datum: letzter.datum,
      verbrauch: vorheriger ? letzter.wert - vorheriger.wert : null,
    });
  });

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

  function handleExport() {
    downloadCsv(
      "zaehler.csv",
      ["Zählernummer", "Typ", "Hauptzähler", "Objekt", "Einheit", "Letzter Zählerstand", "Datum", "Letzter Verbrauch", "Versorger"],
      gefilterteZaehler.map((z) => {
        const stand = standByZaehler.get(z.id);
        return [
          z.zaehlernummer,
          TYP_META[z.typ].label,
          z.hauptzaehler ? "Ja" : "Nein",
          z.objekt?.name ?? z.einheit?.objekt.name ?? "",
          z.einheit?.name ?? "",
          stand?.letzter ?? "",
          stand?.datum.slice(0, 10) ?? "",
          stand?.verbrauch ?? "",
          z.versorger ?? "",
        ];
      }),
    );
  }

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
    <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Zähler</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm font-medium text-text transition hover:bg-surface"
          >
            <Download size={16} /> Exportieren
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-fg transition hover:opacity-90"
          >
            <Plus size={16} /> Neuer Zähler
          </button>
        </div>
      </div>

      <div className="mb-6">
        <StatCard value={zaehlerListe?.length ?? 0} label="Zähler" />
      </div>

      {showForm && (
        <Modal title="Neuer Zähler" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
        </Modal>
      )}

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Zähler durchsuchen…" />
      </div>

      {isLoading && <p className="text-text-muted">Lädt…</p>}

      {zaehlerListe && zaehlerListe.length === 0 && !showForm && (
        <p className="text-text-muted">Noch keine Zähler angelegt.</p>
      )}

      {gefilterteZaehler.length > 0 && (
        <>
          <div className="hidden md:block">
            <DataTable
              columns={[
                { key: "nummer", header: "Zählernummer" },
                { key: "objekt", header: "Objekt/Einheit" },
                { key: "stand", header: "Letzter Zählerstand" },
                { key: "verbrauch", header: "Letzter Verbrauch" },
                { key: "versorger", header: "Versorger" },
              ]}
            >
              {gefilterteZaehler.map((z) => {
                const meta = TYP_META[z.typ];
                const Icon = meta.icon;
                const stand = standByZaehler.get(z.id);
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
                    <td className="px-4 py-3 text-text-muted">
                      {stand ? (
                        <span className="flex items-center gap-1.5">
                          <Gauge size={13} />
                          {stand.letzter.toLocaleString("de-DE")} {meta.einheit}
                        </span>
                      ) : (
                        "–"
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {stand?.verbrauch != null ? (
                        <span className="flex items-center gap-1.5">
                          <TrendingUp size={13} />
                          {stand.verbrauch.toLocaleString("de-DE")} {meta.einheit}
                        </span>
                      ) : (
                        "–"
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-muted">{z.versorger ?? "–"}</td>
                  </tr>
                );
              })}
            </DataTable>
          </div>

          <MobileCardList>
            {gefilterteZaehler.map((z) => {
              const meta = TYP_META[z.typ];
              const Icon = meta.icon;
              const stand = standByZaehler.get(z.id);
              return (
                <div
                  key={z.id}
                  onClick={() => router.push(`/zaehler/${z.id}`)}
                  className="cursor-pointer space-y-2 px-4 py-3 transition hover:bg-bg"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.className}`}>
                      <Icon size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 font-medium">
                        {z.zaehlernummer}
                        {z.hauptzaehler && <Star size={13} className="shrink-0 text-amber-500" />}
                      </p>
                      <p className="text-xs text-text-muted">{meta.label}</p>
                    </div>
                  </div>
                  {(z.einheit || z.objekt) && (
                    <p className="text-sm text-text-muted">
                      {z.einheit ? `${z.einheit.objekt.name} · ${z.einheit.name}` : z.objekt?.name}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
                    {stand && (
                      <span className="flex items-center gap-1.5">
                        <Gauge size={13} />
                        {stand.letzter.toLocaleString("de-DE")} {meta.einheit}
                      </span>
                    )}
                    {stand?.verbrauch != null && (
                      <span className="flex items-center gap-1.5">
                        <TrendingUp size={13} />
                        {stand.verbrauch.toLocaleString("de-DE")} {meta.einheit}
                      </span>
                    )}
                    {z.versorger && <span>{z.versorger}</span>}
                  </div>
                </div>
              );
            })}
          </MobileCardList>
        </>
      )}
    </section>
  );
}
