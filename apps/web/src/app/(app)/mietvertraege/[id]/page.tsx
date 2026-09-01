"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CalendarClock, CheckCircle2, Archive, Banknote, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { MietvertragStatus } from "@maklerprogram/types";
import { useCurrentUser, useMietvertrag, useUpdateMietvertrag, useDeleteMietvertrag } from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { DokumenteSection } from "@/components/DokumenteSection";

function toDateInput(iso: string) {
  return iso.slice(0, 10);
}

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

export default function MietvertragDetailPage() {
  const params = useParams<{ id: string }>();
  const mietvertragId = params.id;
  const router = useRouter();

  const { isError: authError } = useCurrentUser();
  const { data: mietvertrag, isLoading, isError: mietvertragError } = useMietvertrag(mietvertragId);
  const updateMietvertrag = useUpdateMietvertrag(mietvertragId);
  const deleteMietvertrag = useDeleteMietvertrag();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editKaltmiete, setEditKaltmiete] = useState("");
  const [editNebenkosten, setEditNebenkosten] = useState("");
  const [editBeginn, setEditBeginn] = useState("");
  const [editEnde, setEditEnde] = useState("");
  const [editKaution, setEditKaution] = useState("");
  const [editIban, setEditIban] = useState("");
  const [editSepa, setEditSepa] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (authError) router.replace("/login");
  }, [authError, router]);

  useEffect(() => {
    if (mietvertragError) router.replace("/mietvertraege");
  }, [mietvertragError, router]);

  async function handleDelete() {
    await deleteMietvertrag.mutateAsync(mietvertragId);
    router.replace("/mietvertraege");
  }

  function startEdit() {
    if (!mietvertrag) return;
    setEditKaltmiete(String(mietvertrag.kaltmiete));
    setEditNebenkosten(String(mietvertrag.nebenkostenVorauszahlung));
    setEditBeginn(toDateInput(mietvertrag.beginn));
    setEditEnde(mietvertrag.ende ? toDateInput(mietvertrag.ende) : "");
    setEditKaution(mietvertrag.kaution != null ? String(mietvertrag.kaution) : "");
    setEditIban(mietvertrag.iban ?? "");
    setEditSepa(mietvertrag.sepaLastschrift);
    setEditError(null);
    setEditing(true);
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    setEditError(null);
    try {
      await updateMietvertrag.mutateAsync({
        kaltmiete: Number(editKaltmiete),
        nebenkostenVorauszahlung: Number(editNebenkosten),
        beginn: editBeginn,
        ende: editEnde || undefined,
        kaution: editKaution ? Number(editKaution) : undefined,
        iban: editIban || undefined,
        sepaLastschrift: editSepa,
      });
      setEditing(false);
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : "Mietvertrag konnte nicht gespeichert werden.");
    }
  }

  if (isLoading || !mietvertrag) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-text-muted">Lädt…</div>
    );
  }

  return (
          <section className="mx-auto max-w-3xl px-6 py-10">
        <nav className="mb-4 flex items-center gap-2 text-sm text-text-muted">
          <Link href="/mietvertraege" className="hover:text-primary">
            Mietverträge
          </Link>
          <span>/</span>
          <span className="text-text">
            {mietvertrag.einheit.objekt.name} · {mietvertrag.einheit.name}
          </span>
        </nav>

        <div className="mb-6 flex items-start justify-between">
          {!editing && (
            <div>
              <h1 className="text-2xl font-semibold">
                {mietvertrag.einheit.objekt.name} · {mietvertrag.einheit.name}
              </h1>
              <p className="mt-1 text-text-muted">Mieter: {kontaktName(mietvertrag.mieter)}</p>
              <p className="mt-1 text-text-muted">
                {mietvertrag.kaltmiete.toFixed(2)} € kalt
                {mietvertrag.nebenkostenVorauszahlung > 0 &&
                  ` · ${mietvertrag.nebenkostenVorauszahlung.toFixed(2)} € Nebenkosten`}
                {` · ${(mietvertrag.kaltmiete + mietvertrag.nebenkostenVorauszahlung).toFixed(2)} € warm`}
              </p>
              <p className="mt-1 text-sm text-text-muted">
                Beginn {new Date(mietvertrag.beginn).toLocaleDateString("de-DE")}
                {mietvertrag.ende && ` · Ende ${new Date(mietvertrag.ende).toLocaleDateString("de-DE")}`}
              </p>
              {(mietvertrag.kaution != null || mietvertrag.iban || mietvertrag.sepaLastschrift) && (
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-muted">
                  {mietvertrag.kaution != null && (
                    <span className="flex items-center gap-1">
                      <Banknote size={13} />
                      {mietvertrag.kaution.toFixed(2)} € Kaution
                    </span>
                  )}
                  {mietvertrag.iban && <span>IBAN {mietvertrag.iban}</span>}
                  {mietvertrag.sepaLastschrift && (
                    <span className="flex items-center gap-1 text-emerald-500">
                      <ShieldCheck size={13} />
                      SEPA-Mandat
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {!editing && (
            <div className="flex items-center gap-3">
              {!confirmDelete && (
                <button
                  onClick={startEdit}
                  className="text-text-muted transition hover:text-primary"
                  aria-label="Mietvertrag bearbeiten"
                >
                  <Pencil size={18} />
                </button>
              )}
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-text-muted transition hover:text-red-500"
                  aria-label="Mietvertrag löschen"
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
                <label className="mb-1 block text-sm text-text-muted" htmlFor="editKaltmiete">
                  Kaltmiete (€)
                </label>
                <input
                  id="editKaltmiete"
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={editKaltmiete}
                  onChange={(e) => setEditKaltmiete(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="editNebenkosten">
                  Nebenkosten (€)
                </label>
                <input
                  id="editNebenkosten"
                  type="number"
                  min={0}
                  step="0.01"
                  value={editNebenkosten}
                  onChange={(e) => setEditNebenkosten(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="editBeginn">
                  Beginn
                </label>
                <input
                  id="editBeginn"
                  type="date"
                  required
                  value={editBeginn}
                  onChange={(e) => setEditBeginn(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="editEnde">
                  Ende (optional)
                </label>
                <input
                  id="editEnde"
                  type="date"
                  value={editEnde}
                  onChange={(e) => setEditEnde(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="editKaution">
                  Kaution (€, optional)
                </label>
                <input
                  id="editKaution"
                  type="number"
                  min={0}
                  step="0.01"
                  value={editKaution}
                  onChange={(e) => setEditKaution(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="editIban">
                  IBAN (optional)
                </label>
                <input
                  id="editIban"
                  type="text"
                  value={editIban}
                  onChange={(e) => setEditIban(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editSepa}
                onChange={(e) => setEditSepa(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              SEPA-Lastschriftmandat vorhanden
            </label>

            {editError && <p className="text-sm text-red-500">{editError}</p>}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updateMietvertrag.isPending}
                className="flex-1 rounded-lg bg-primary py-2 font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
              >
                {updateMietvertrag.isPending ? "Wird gespeichert…" : "Speichern"}
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
          {Object.values(MietvertragStatus).map((s) => {
            const meta = STATUS_META[s];
            const Icon = meta.icon;
            const active = mietvertrag.status === s;
            return (
              <button
                key={s}
                onClick={() => updateMietvertrag.mutate({ status: s })}
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

        <DokumenteSection parent={{ path: "mietvertraege", id: mietvertragId }} />
      </section>
  );
}
