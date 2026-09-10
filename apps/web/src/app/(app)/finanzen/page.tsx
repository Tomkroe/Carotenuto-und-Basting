"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Download, Pencil, Plus, Trash2, X } from "lucide-react";
import { Beleg, BelegStatus, BelegTyp, Forderung, ForderungStatusWert, ForderungTyp } from "@maklerprogram/types";
import {
  useCurrentUser,
  useForderungen,
  useMarkForderung,
  useBelege,
  useCreateBeleg,
  useUpdateBeleg,
  useDeleteBeleg,
  useObjekte,
  useDokumentKategorien,
  useCreateDokumentKategorie,
} from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { downloadCsv } from "@/lib/csvExport";
import { StatCard } from "@/components/StatCard";
import { DataTable } from "@/components/DataTable";
import { Modal } from "@/components/Modal";

const FORDERUNG_STATUS_META: Record<ForderungStatusWert, { label: string; className: string }> = {
  [ForderungStatusWert.OFFEN]: { label: "Offen", className: "bg-blue-500/10 text-blue-500" },
  [ForderungStatusWert.UEBERFAELLIG]: { label: "Überfällig", className: "bg-red-500/10 text-red-500" },
  [ForderungStatusWert.BEZAHLT]: { label: "Bezahlt", className: "bg-emerald-500/10 text-emerald-500" },
  [ForderungStatusWert.VERLOREN]: { label: "Verloren", className: "bg-text-muted/10 text-text-muted" },
};

export default function FinanzenPage() {
  const router = useRouter();
  const { isError: authError } = useCurrentUser();
  const [tab, setTab] = useState<"forderungen" | "belege">("forderungen");

  useEffect(() => {
    if (authError) router.replace("/login");
  }, [authError, router]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Finanzen</h1>
      </div>

      <div className="mb-6 flex items-center gap-1 border-b border-border">
        {(
          [
            { key: "forderungen", label: "Mieten & Forderungen" },
            { key: "belege", label: "Belege" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "forderungen" ? <ForderungenTab /> : <BelegeTab />}
    </section>
  );
}

function ForderungenTab() {
  const { data: objekte } = useObjekte();
  const { data: forderungen, isLoading } = useForderungen();
  const markForderung = useMarkForderung();

  const [objektFilter, setObjektFilter] = useState("ALLE");
  const [statusFilter, setStatusFilter] = useState("ALLE");

  const ueberfaellig = (forderungen ?? []).filter((f) => f.status === ForderungStatusWert.UEBERFAELLIG);
  const offen = (forderungen ?? []).filter((f) => f.status === ForderungStatusWert.OFFEN);
  const bezahlt = (forderungen ?? []).filter((f) => f.status === ForderungStatusWert.BEZAHLT);

  const gefiltert = useMemo(() => {
    return (forderungen ?? [])
      .filter((f) => objektFilter === "ALLE" || f.objekt.id === objektFilter)
      .filter((f) => statusFilter === "ALLE" || f.status === statusFilter);
  }, [forderungen, objektFilter, statusFilter]);

  function kontaktName(k: { vorname: string | null; nachname: string | null; firma: string | null }) {
    return [k.vorname, k.nachname].filter(Boolean).join(" ") || k.firma || "Unbenannt";
  }

  function handleStatusChange(f: Forderung, status: "BEZAHLT" | "VERLOREN" | "OFFEN") {
    markForderung.mutate({ mietvertragId: f.mietvertragId, typ: f.typ, periode: f.periode, status });
  }

  function handleExport() {
    downloadCsv(
      "mieten-forderungen.csv",
      ["Mieter", "Objekt", "Einheit", "Zweck", "Fälligkeit", "Betrag (€)", "Status"],
      gefiltert.map((f) => [
        kontaktName(f.mieter),
        f.objekt.name,
        f.einheit.name,
        f.zweck,
        f.faelligkeitsdatum.slice(0, 10),
        f.betrag,
        FORDERUNG_STATUS_META[f.status].label,
      ]),
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="grid flex-1 grid-cols-3 gap-4">
          <StatCard value={ueberfaellig.length} label="Überfällige Mieten" tone={ueberfaellig.length > 0 ? "danger" : "default"} />
          <StatCard value={offen.length} label="Offene Mieten" />
          <StatCard value={bezahlt.length} label="Bezahlte Mieten" tone="success" />
        </div>
        <button
          onClick={handleExport}
          className="ml-4 flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm font-medium text-text transition hover:bg-surface"
        >
          <Download size={16} /> Exportieren
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={objektFilter}
          onChange={(e) => setObjektFilter(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="ALLE">Alle Objekte</option>
          {objekte?.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="ALLE">Alle Status</option>
          {Object.entries(FORDERUNG_STATUS_META).map(([key, meta]) => (
            <option key={key} value={key}>
              {meta.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-text-muted">Zeitraum: aktuelles Jahr</span>
      </div>

      {isLoading && <p className="text-text-muted">Lädt…</p>}
      {forderungen && forderungen.length === 0 && <p className="text-text-muted">Keine Forderungen im aktuellen Jahr.</p>}

      {gefiltert.length > 0 && (
        <DataTable
          columns={[
            { key: "mieter", header: "Mieter" },
            { key: "objekt", header: "Objekt" },
            { key: "zweck", header: "Zweck" },
            { key: "faelligkeit", header: "Fälligkeit" },
            { key: "betrag", header: "Betrag" },
            { key: "status", header: "Status" },
          ]}
        >
          {gefiltert.map((f) => {
            const meta = FORDERUNG_STATUS_META[f.status];
            return (
              <tr key={`${f.mietvertragId}:${f.typ}:${f.periode}`} className="transition hover:bg-bg">
                <td className="px-4 py-3 font-medium">{kontaktName(f.mieter)}</td>
                <td className="px-4 py-3 text-text-muted">
                  {f.objekt.name}
                  <span className="block text-xs">{f.einheit.name}</span>
                </td>
                <td className="px-4 py-3 text-text-muted">{f.zweck}</td>
                <td className="px-4 py-3 text-text-muted">{new Date(f.faelligkeitsdatum).toLocaleDateString("de-DE")}</td>
                <td className="px-4 py-3 font-medium">{f.betrag.toLocaleString("de-DE")} €</td>
                <td className="px-4 py-3">
                  <select
                    value={f.status === ForderungStatusWert.UEBERFAELLIG ? ForderungStatusWert.OFFEN : f.status}
                    onChange={(e) => handleStatusChange(f, e.target.value as "BEZAHLT" | "VERLOREN" | "OFFEN")}
                    className={`w-fit rounded-full border-none px-2.5 py-1 text-xs outline-none ${meta.className}`}
                  >
                    <option value="OFFEN">{f.status === ForderungStatusWert.UEBERFAELLIG ? "Überfällig" : "Offen"}</option>
                    <option value="BEZAHLT">Bezahlt</option>
                    <option value="VERLOREN">Verloren</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </DataTable>
      )}
    </div>
  );
}

const BELEG_KATEGORIE_LEER = "__leer__";
const BELEG_KATEGORIE_NEU = "__neu__";
const BELEG_OBJEKT_LEER = "__leer__";

function BelegeTab() {
  const { data: belege, isLoading } = useBelege();
  const { data: objekte } = useObjekte();
  const { data: kategorien } = useDokumentKategorien();
  const createBeleg = useCreateBeleg();
  const updateBeleg = useUpdateBeleg();
  const deleteBeleg = useDeleteBeleg();
  const createKategorie = useCreateDokumentKategorie();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Beleg | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [belegnummer, setBelegnummer] = useState("");
  const [typ, setTyp] = useState<BelegTyp>(BelegTyp.AUSGABE);
  const [betrag, setBetrag] = useState("");
  const [belegdatum, setBelegdatum] = useState("");
  const [status, setStatus] = useState<BelegStatus>(BelegStatus.OFFEN);
  const [objektId, setObjektId] = useState(BELEG_OBJEKT_LEER);
  const [kategorieId, setKategorieId] = useState(BELEG_KATEGORIE_LEER);
  const [notiz, setNotiz] = useState("");
  const [showNewKategorie, setShowNewKategorie] = useState(false);
  const [newKategorieName, setNewKategorieName] = useState("");

  const summeAusgaben = (belege ?? []).filter((b) => b.typ === BelegTyp.AUSGABE).reduce((sum, b) => sum + b.betrag, 0);
  const summeEinnahmen = (belege ?? []).filter((b) => b.typ === BelegTyp.EINNAHME).reduce((sum, b) => sum + b.betrag, 0);

  function resetForm() {
    setEditing(null);
    setName("");
    setBelegnummer("");
    setTyp(BelegTyp.AUSGABE);
    setBetrag("");
    setBelegdatum("");
    setStatus(BelegStatus.OFFEN);
    setObjektId(BELEG_OBJEKT_LEER);
    setKategorieId(BELEG_KATEGORIE_LEER);
    setNotiz("");
    setError(null);
    setShowNewKategorie(false);
    setNewKategorieName("");
  }

  async function handleCreateKategorie() {
    if (!newKategorieName.trim()) return;
    try {
      const kategorie = await createKategorie.mutateAsync({ name: newKategorieName.trim() });
      setKategorieId(kategorie.id);
      setShowNewKategorie(false);
      setNewKategorieName("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kategorie konnte nicht angelegt werden.");
    }
  }

  function handleExport() {
    downloadCsv(
      "belege.csv",
      ["Name", "Objekt", "Kategorie", "Art", "Belegdatum", "Belegnummer", "Status", "Betrag (€)"],
      (belege ?? []).map((b) => [
        b.name,
        b.objekt?.name ?? "",
        b.kategorie?.name ?? "",
        b.typ === BelegTyp.AUSGABE ? "Ausgabe" : "Einnahme",
        b.belegdatum.slice(0, 10),
        b.belegnummer ?? "",
        b.status === BelegStatus.BEZAHLT ? "Bezahlt" : "Offen",
        b.typ === BelegTyp.AUSGABE ? -b.betrag : b.betrag,
      ]),
    );
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(b: Beleg) {
    setEditing(b);
    setName(b.name);
    setBelegnummer(b.belegnummer ?? "");
    setTyp(b.typ);
    setBetrag(String(b.betrag));
    setBelegdatum(b.belegdatum.slice(0, 10));
    setStatus(b.status);
    setObjektId(b.objekt?.id ?? BELEG_OBJEKT_LEER);
    setKategorieId(b.kategorie?.id ?? BELEG_KATEGORIE_LEER);
    setNotiz(b.notiz ?? "");
    setError(null);
    setShowNewKategorie(false);
    setNewKategorieName("");
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const data = {
      name,
      belegnummer: belegnummer || undefined,
      typ,
      betrag: Number(betrag),
      belegdatum,
      status,
      objektId: objektId === BELEG_OBJEKT_LEER ? undefined : objektId,
      kategorieId: kategorieId === BELEG_KATEGORIE_LEER ? undefined : kategorieId,
      notiz: notiz || undefined,
    };
    try {
      if (editing) {
        await updateBeleg.mutateAsync({ id: editing.id, data });
      } else {
        await createBeleg.mutateAsync(data);
      }
      setShowForm(false);
      resetForm();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Beleg konnte nicht gespeichert werden.");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="grid grid-cols-2 gap-4">
          <StatCard value={`${summeEinnahmen.toLocaleString("de-DE")} €`} label="Einnahmen" tone="success" />
          <StatCard value={`${summeAusgaben.toLocaleString("de-DE")} €`} label="Ausgaben" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm font-medium text-text transition hover:bg-surface"
          >
            <Download size={16} /> Exportieren
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-fg transition hover:opacity-90"
          >
            <Plus size={16} /> Beleg anlegen
          </button>
        </div>
      </div>

      {showForm && (
        <Modal title={editing ? "Beleg bearbeiten" : "Neuer Beleg"} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="beleg-name">
                Name
              </label>
              <input
                id="beleg-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="beleg-typ">
                  Art
                </label>
                <select
                  id="beleg-typ"
                  value={typ}
                  onChange={(e) => setTyp(e.target.value as BelegTyp)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                >
                  <option value={BelegTyp.AUSGABE}>Ausgabe</option>
                  <option value={BelegTyp.EINNAHME}>Einnahme</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="beleg-betrag">
                  Betrag (€)
                </label>
                <input
                  id="beleg-betrag"
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={betrag}
                  onChange={(e) => setBetrag(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="beleg-datum">
                  Belegdatum
                </label>
                <input
                  id="beleg-datum"
                  type="date"
                  required
                  value={belegdatum}
                  onChange={(e) => setBelegdatum(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="beleg-status">
                  Status
                </label>
                <select
                  id="beleg-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BelegStatus)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                >
                  <option value={BelegStatus.OFFEN}>Offen</option>
                  <option value={BelegStatus.BEZAHLT}>Bezahlt</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="beleg-objekt">
                  Objekt (optional)
                </label>
                <select
                  id="beleg-objekt"
                  value={objektId}
                  onChange={(e) => setObjektId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                >
                  <option value={BELEG_OBJEKT_LEER}>Kein Objekt</option>
                  {objekte?.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="beleg-kategorie">
                  Kategorie (optional)
                </label>
                {showNewKategorie ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      autoFocus
                      value={newKategorieName}
                      onChange={(e) => setNewKategorieName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateKategorie();
                        }
                      }}
                      placeholder="Neue Kategorie…"
                      className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={handleCreateKategorie}
                      disabled={createKategorie.isPending}
                      aria-label="Kategorie anlegen"
                      className="rounded-lg p-2 text-emerald-500 transition hover:bg-bg disabled:opacity-50"
                    >
                      <Check size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewKategorie(false);
                        setNewKategorieName("");
                      }}
                      aria-label="Abbrechen"
                      className="rounded-lg p-2 text-text-muted transition hover:bg-bg hover:text-text"
                    >
                      <X size={17} />
                    </button>
                  </div>
                ) : (
                  <select
                    id="beleg-kategorie"
                    value={kategorieId}
                    onChange={(e) => {
                      if (e.target.value === BELEG_KATEGORIE_NEU) {
                        setShowNewKategorie(true);
                      } else {
                        setKategorieId(e.target.value);
                      }
                    }}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                  >
                    <option value={BELEG_KATEGORIE_LEER}>Keine Kategorie</option>
                    {kategorien?.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name}
                      </option>
                    ))}
                    <option value={BELEG_KATEGORIE_NEU}>+ Neue Kategorie…</option>
                  </select>
                )}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="beleg-belegnummer">
                Belegnummer (optional)
              </label>
              <input
                id="beleg-belegnummer"
                type="text"
                value={belegnummer}
                onChange={(e) => setBelegnummer(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="beleg-notiz">
                Notiz (optional)
              </label>
              <textarea
                id="beleg-notiz"
                value={notiz}
                onChange={(e) => setNotiz(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={createBeleg.isPending || updateBeleg.isPending}
              className="w-full rounded-lg bg-primary py-2 font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
            >
              {createBeleg.isPending || updateBeleg.isPending ? "Wird gespeichert…" : editing ? "Speichern" : "Beleg anlegen"}
            </button>
          </form>
        </Modal>
      )}

      {isLoading && <p className="text-text-muted">Lädt…</p>}
      {belege && belege.length === 0 && <p className="text-text-muted">Noch keine Belege erfasst.</p>}

      {belege && belege.length > 0 && (
        <DataTable
          columns={[
            { key: "name", header: "Name" },
            { key: "objekt", header: "Objekt" },
            { key: "kategorie", header: "Kategorie" },
            { key: "datum", header: "Belegdatum" },
            { key: "status", header: "Status" },
            { key: "betrag", header: "Betrag" },
            { key: "aktionen", header: "" },
          ]}
        >
          {belege.map((b) => (
            <tr key={b.id} className="transition hover:bg-bg">
              <td className="px-4 py-3 font-medium">{b.name}</td>
              <td className="px-4 py-3 text-text-muted">{b.objekt?.name ?? "–"}</td>
              <td className="px-4 py-3 text-text-muted">{b.kategorie?.name ?? "–"}</td>
              <td className="px-4 py-3 text-text-muted">{new Date(b.belegdatum).toLocaleDateString("de-DE")}</td>
              <td className="px-4 py-3">
                <span
                  className={`w-fit rounded-full px-2.5 py-1 text-xs ${
                    b.status === BelegStatus.BEZAHLT ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                  }`}
                >
                  {b.status === BelegStatus.BEZAHLT ? "Bezahlt" : "Offen"}
                </span>
              </td>
              <td className={`px-4 py-3 font-medium ${b.typ === BelegTyp.AUSGABE ? "text-red-500" : "text-emerald-500"}`}>
                {b.typ === BelegTyp.AUSGABE ? "−" : "+"}
                {b.betrag.toLocaleString("de-DE")} €
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  {confirmDeleteId === b.id ? (
                    <>
                      <span className="text-xs text-text-muted">Löschen?</span>
                      <button
                        onClick={() => {
                          deleteBeleg.mutate(b.id);
                          setConfirmDeleteId(null);
                        }}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-500/10"
                      >
                        Ja
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-lg px-2 py-1 text-xs text-text-muted hover:bg-surface"
                      >
                        Abbrechen
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => openEdit(b)}
                        aria-label={`Beleg ${b.name} bearbeiten`}
                        className="rounded-lg p-1.5 text-text-muted transition hover:bg-bg hover:text-text"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(b.id)}
                        aria-label={`Beleg ${b.name} löschen`}
                        className="rounded-lg p-1.5 text-text-muted transition hover:bg-bg hover:text-red-500"
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
}
