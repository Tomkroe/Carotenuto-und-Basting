"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FileEdit, Send, Trash2, Receipt, Pencil, PieChart } from "lucide-react";
import { NebenkostenStatus, VerteilerSchluessel } from "@maklerprogram/types";
import {
  useCurrentUser,
  useNebenkostenabrechnung,
  useUpdateNebenkostenabrechnung,
  useDeleteNebenkostenabrechnung,
  useNebenkostenPositionen,
  useCreateNebenkostenPosition,
  useDeleteNebenkostenPosition,
} from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { KommentareSection } from "@/components/KommentareSection";
import { DokumenteSection } from "@/components/DokumenteSection";

const STATUS_META: Record<NebenkostenStatus, { label: string; icon: typeof FileEdit; className: string }> = {
  [NebenkostenStatus.ENTWURF]: { label: "Entwurf", icon: FileEdit, className: "bg-blue-500/10 text-blue-500" },
  [NebenkostenStatus.VERSENDET]: {
    label: "Versendet",
    icon: Send,
    className: "bg-emerald-500/10 text-emerald-500",
  },
};

const VERTEILER_LABEL: Record<VerteilerSchluessel, string> = {
  [VerteilerSchluessel.QM]: "m² (Fläche)",
  [VerteilerSchluessel.PERSONEN]: "Personen",
  [VerteilerSchluessel.VERBRAUCH]: "Verbrauch",
  [VerteilerSchluessel.EINHEITEN]: "Einheiten",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE");
}

function formatEuro(value: number) {
  return value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function NebenkostenabrechnungDetailPage() {
  const params = useParams<{ id: string }>();
  const abrechnungId = params.id;
  const router = useRouter();

  const { isError: authError } = useCurrentUser();
  const { data: abrechnung, isLoading, isError: abrechnungError } = useNebenkostenabrechnung(abrechnungId);
  const updateAbrechnung = useUpdateNebenkostenabrechnung(abrechnungId);
  const deleteAbrechnung = useDeleteNebenkostenabrechnung();

  const { data: positionen } = useNebenkostenPositionen(abrechnungId);
  const createPosition = useCreateNebenkostenPosition(abrechnungId);
  const deletePosition = useDeleteNebenkostenPosition(abrechnungId);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [bezeichnung, setBezeichnung] = useState("");
  const [betrag, setBetrag] = useState("");
  const [verteilerschluessel, setVerteilerschluessel] = useState<VerteilerSchluessel>(VerteilerSchluessel.QM);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [editVon, setEditVon] = useState("");
  const [editBis, setEditBis] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (authError) router.replace("/login");
  }, [authError, router]);

  useEffect(() => {
    if (abrechnungError) router.replace("/nebenkostenabrechnungen");
  }, [abrechnungError, router]);

  const summe = useMemo(() => (positionen ?? []).reduce((sum, p) => sum + p.betrag, 0), [positionen]);

  async function handleDelete() {
    await deleteAbrechnung.mutateAsync(abrechnungId);
    router.replace("/nebenkostenabrechnungen");
  }

  function startEdit() {
    if (!abrechnung) return;
    setEditVon(abrechnung.zeitraumVon.slice(0, 10));
    setEditBis(abrechnung.zeitraumBis.slice(0, 10));
    setEditError(null);
    setEditing(true);
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    setEditError(null);
    try {
      await updateAbrechnung.mutateAsync({ zeitraumVon: editVon, zeitraumBis: editBis });
      setEditing(false);
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : "Abrechnung konnte nicht gespeichert werden.");
    }
  }

  async function handleAddPosition(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createPosition.mutateAsync({ bezeichnung, betrag: Number(betrag), verteilerschluessel });
      setBezeichnung("");
      setBetrag("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Position konnte nicht angelegt werden.");
    }
  }

  if (isLoading || !abrechnung) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-text-muted">Lädt…</div>
    );
  }

  return (
          <section className="mx-auto max-w-3xl px-6 py-10">
        <nav className="mb-4 flex items-center gap-2 text-sm text-text-muted">
          <Link href="/nebenkostenabrechnungen" className="hover:text-primary">
            Nebenkostenabrechnungen
          </Link>
          <span>/</span>
          <span className="text-text">{abrechnung.objekt.name}</span>
        </nav>

        <div className="mb-6 flex items-start justify-between">
          {!editing && (
            <div>
              <h1 className="text-2xl font-semibold">{abrechnung.objekt.name}</h1>
              <p className="mt-1 text-text-muted">
                {formatDate(abrechnung.zeitraumVon)} – {formatDate(abrechnung.zeitraumBis)}
              </p>
            </div>
          )}

          {!editing && (
            <div className="flex items-center gap-3">
              {!confirmDelete && (
                <button
                  onClick={startEdit}
                  className="text-text-muted transition hover:text-primary"
                  aria-label="Abrechnung bearbeiten"
                >
                  <Pencil size={18} />
                </button>
              )}
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-text-muted transition hover:text-red-500"
                  aria-label="Abrechnung löschen"
                >
                  <Trash2 size={18} />
                </button>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-text-muted">Wirklich löschen?</span>
                  <button
                    onClick={handleDelete}
                    className="rounded-full bg-red-500 px-3 py-1.5 text-white transition hover:opacity-90"
                  >
                    Ja
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-full border border-border px-3 py-1.5 text-text-muted"
                  >
                    Abbrechen
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {editing && (
          <form onSubmit={handleSaveEdit} className="mb-6 space-y-4 rounded-lg border border-border bg-surface p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="editVon">
                  Zeitraum von
                </label>
                <input
                  id="editVon"
                  type="date"
                  required
                  value={editVon}
                  onChange={(e) => setEditVon(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="editBis">
                  Zeitraum bis
                </label>
                <input
                  id="editBis"
                  type="date"
                  required
                  value={editBis}
                  onChange={(e) => setEditBis(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
            </div>

            {editError && <p className="text-sm text-red-500">{editError}</p>}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updateAbrechnung.isPending}
                className="flex-1 rounded-lg bg-primary py-2 font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
              >
                {updateAbrechnung.isPending ? "Wird gespeichert…" : "Speichern"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg border border-border px-4 py-2 text-text-muted"
              >
                Abbrechen
              </button>
            </div>
          </form>
        )}

        <div className="mb-8 flex gap-2">
          {Object.values(NebenkostenStatus).map((s) => {
            const meta = STATUS_META[s];
            const Icon = meta.icon;
            const active = abrechnung.status === s;
            return (
              <button
                key={s}
                onClick={() => updateAbrechnung.mutate({ status: s })}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition ${
                  active ? meta.className : "border border-border text-text-muted hover:border-primary"
                }`}
              >
                <Icon size={14} />
                {meta.label}
              </button>
            );
          })}
        </div>

        <h2 className="mb-3 flex items-center gap-1.5 text-lg font-semibold">
          <Receipt size={18} />
          Positionen
        </h2>

        <form onSubmit={handleAddPosition} className="mb-4 grid grid-cols-[1fr_auto_auto_auto] items-end gap-2">
          <div>
            <label className="mb-1 block text-sm text-text-muted" htmlFor="bezeichnung">
              Bezeichnung
            </label>
            <input
              id="bezeichnung"
              type="text"
              required
              value={bezeichnung}
              onChange={(e) => setBezeichnung(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted" htmlFor="betrag">
              Betrag (€)
            </label>
            <input
              id="betrag"
              type="number"
              min={0}
              step="0.01"
              required
              value={betrag}
              onChange={(e) => setBetrag(e.target.value)}
              className="w-28 rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted" htmlFor="verteilerschluessel">
              Verteilerschlüssel
            </label>
            <select
              id="verteilerschluessel"
              value={verteilerschluessel}
              onChange={(e) => setVerteilerschluessel(e.target.value as VerteilerSchluessel)}
              className="rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
            >
              {Object.values(VerteilerSchluessel).map((v) => (
                <option key={v} value={v}>
                  {VERTEILER_LABEL[v]}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={createPosition.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
          >
            Hinzufügen
          </button>
        </form>

        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

        {positionen && positionen.length === 0 && <p className="text-sm text-text-muted">Keine Positionen erfasst.</p>}

        {positionen && positionen.length > 0 && (
          <>
            <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
              {positionen.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-4 py-2.5">
                  <div>
                    <p className="text-sm">{p.bezeichnung}</p>
                    <p className="text-xs text-text-muted">{VERTEILER_LABEL[p.verteilerschluessel]}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{formatEuro(p.betrag)} €</span>
                    <button
                      onClick={() => deletePosition.mutate(p.id)}
                      className="text-text-muted transition hover:text-red-500"
                      aria-label="Position löschen"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-end text-sm font-semibold">
              Summe: {formatEuro(summe)} €
            </div>
          </>
        )}

        {abrechnung.kostenverteilung && abrechnung.kostenverteilung.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 flex items-center gap-1.5 text-lg font-semibold">
              <PieChart size={18} />
              Kostenverteilung je Einheit
            </h2>
            <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
              {abrechnung.kostenverteilung.map((k) => (
                <li key={k.einheit.id} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm">{k.einheit.name}</span>
                  <span className="text-sm font-medium">{formatEuro(k.betrag)} €</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-text-muted">
              Positionen mit Verteilerschlüssel „{VERTEILER_LABEL[VerteilerSchluessel.QM]}“ werden nach
              Wohnflächenanteil verteilt, alle anderen aktuell zu gleichen Teilen (Personen-/Verbrauchswerte pro
              Einheit sind noch nicht erfasst).
            </p>
          </div>
        )}

        <div className="mt-8">
          <DokumenteSection parent={{ path: "nebenkostenabrechnungen", id: abrechnungId }} />
        </div>

        <div className="mt-8">
          <KommentareSection parent={{ path: "nebenkostenabrechnungen", id: abrechnungId }} />
        </div>
      </section>
  );
}
