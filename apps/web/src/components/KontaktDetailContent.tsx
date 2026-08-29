"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Home, KeyRound, Mail, Pencil, Phone, Sparkles, Trash2, UserRound, Wrench } from "lucide-react";
import { KontaktTyp } from "@maklerprogram/types";
import { useCurrentUser, useKontakt, useKontaktObjekte, useUpdateKontakt, useDeleteKontakt } from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { DokumenteSection } from "@/components/DokumenteSection";
import { KommentareSection } from "@/components/KommentareSection";

const KONTAKT_TYP_META: Record<KontaktTyp, { label: string; icon: typeof UserRound; className: string }> = {
  [KontaktTyp.MIETER]: { label: "Mieter", icon: UserRound, className: "bg-blue-500/10 text-blue-500" },
  [KontaktTyp.EIGENTUEMER]: { label: "Eigentümer", icon: KeyRound, className: "bg-amber-500/10 text-amber-500" },
  [KontaktTyp.HAUSVERWALTUNG]: {
    label: "Hausverwaltung",
    icon: Building2,
    className: "bg-violet-500/10 text-violet-500",
  },
  [KontaktTyp.DIENSTLEISTER]: {
    label: "Dienstleister",
    icon: Wrench,
    className: "bg-emerald-500/10 text-emerald-500",
  },
  [KontaktTyp.SONSTIGE]: { label: "Sonstige", icon: Sparkles, className: "bg-text-muted/10 text-text-muted" },
};

const ROLLE_META: Record<"MIETER" | "EIGENTUEMER", { label: string; className: string }> = {
  MIETER: { label: "Mieter", className: "bg-blue-500/10 text-blue-500" },
  EIGENTUEMER: { label: "Eigentümer", className: "bg-amber-500/10 text-amber-500" },
};

export function KontaktDetailContent({ kontaktId }: { kontaktId: string }) {
  const router = useRouter();

  const { isError: authError } = useCurrentUser();
  const { data: kontakt, isLoading, isError: kontaktError } = useKontakt(kontaktId);
  const { data: zuordnungen } = useKontaktObjekte(kontaktId);
  const updateKontakt = useUpdateKontakt(kontaktId);
  const deleteKontakt = useDeleteKontakt();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTyp, setEditTyp] = useState<KontaktTyp>(KontaktTyp.MIETER);
  const [editVorname, setEditVorname] = useState("");
  const [editNachname, setEditNachname] = useState("");
  const [editFirma, setEditFirma] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTelefon, setEditTelefon] = useState("");
  const [editDebitorNr, setEditDebitorNr] = useState("");
  const [editKreditorNr, setEditKreditorNr] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (authError) router.replace("/login");
  }, [authError, router]);

  useEffect(() => {
    if (kontaktError) router.replace("/kontakte");
  }, [kontaktError, router]);

  async function handleDelete() {
    await deleteKontakt.mutateAsync(kontaktId);
    router.replace("/kontakte");
  }

  function startEdit() {
    if (!kontakt) return;
    setEditTyp(kontakt.typ);
    setEditVorname(kontakt.vorname ?? "");
    setEditNachname(kontakt.nachname ?? "");
    setEditFirma(kontakt.firma ?? "");
    setEditEmail(kontakt.email ?? "");
    setEditTelefon(kontakt.telefon ?? "");
    setEditDebitorNr(kontakt.debitorNr ?? "");
    setEditKreditorNr(kontakt.kreditorNr ?? "");
    setEditError(null);
    setEditing(true);
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    setEditError(null);
    try {
      await updateKontakt.mutateAsync({
        typ: editTyp,
        vorname: editVorname || undefined,
        nachname: editNachname || undefined,
        firma: editFirma || undefined,
        email: editEmail || undefined,
        telefon: editTelefon || undefined,
        debitorNr: editDebitorNr || undefined,
        kreditorNr: editKreditorNr || undefined,
      });
      setEditing(false);
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : "Kontakt konnte nicht gespeichert werden.");
    }
  }

  if (isLoading || !kontakt) {
    return <div className="flex min-h-[50vh] items-center justify-center text-text-muted">Lädt…</div>;
  }

  const meta = KONTAKT_TYP_META[kontakt.typ];
  const Icon = meta.icon;
  const displayName = [kontakt.vorname, kontakt.nachname].filter(Boolean).join(" ") || kontakt.firma || "Unbenannt";

  return (
    <>
      <nav className="mb-4 flex items-center gap-2 text-sm text-text-muted">
        <Link href="/kontakte" className="hover:text-primary">
          Kontakte
        </Link>
        <span>/</span>
        <span className="text-text">{displayName}</span>
      </nav>

      <div className="mb-8 flex items-start justify-between">
        {!editing && (
          <div className="flex items-center gap-3">
            <span className={`flex h-12 w-12 items-center justify-center rounded-full ${meta.className}`}>
              <Icon size={22} />
            </span>
            <div>
              <h1 className="text-2xl font-semibold">{displayName}</h1>
              {(kontakt.kreditorNr || kontakt.debitorNr) && (
                <p className="text-xs text-text-muted">
                  {kontakt.kreditorNr && `Kreditor-ID: ${kontakt.kreditorNr}`}
                  {kontakt.kreditorNr && kontakt.debitorNr && " | "}
                  {kontakt.debitorNr && `Debitor-ID: ${kontakt.debitorNr}`}
                </p>
              )}
              <div className="mt-0.5 flex flex-wrap items-center gap-3 text-sm text-text-muted">
                <span>{meta.label}</span>
                {kontakt.firma && [kontakt.vorname, kontakt.nachname].filter(Boolean).length > 0 && (
                  <span>{kontakt.firma}</span>
                )}
                {kontakt.email && (
                  <span className="flex items-center gap-1">
                    <Mail size={13} /> {kontakt.email}
                  </span>
                )}
                {kontakt.telefon && (
                  <span className="flex items-center gap-1">
                    <Phone size={13} /> {kontakt.telefon}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {!editing && (
          <div className="flex items-center gap-3">
            {!confirmDelete && (
              <button
                onClick={startEdit}
                className="text-text-muted transition hover:text-primary"
                aria-label="Kontakt bearbeiten"
              >
                <Pencil size={18} />
              </button>
            )}
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-text-muted transition hover:text-red-500"
                aria-label="Kontakt löschen"
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
        <form onSubmit={handleSaveEdit} className="mb-8 space-y-4 rounded-lg border border-border bg-surface p-4">
          <div>
            <label className="mb-1 block text-sm text-text-muted" htmlFor="editTyp">
              Typ
            </label>
            <select
              id="editTyp"
              value={editTyp}
              onChange={(e) => setEditTyp(e.target.value as KontaktTyp)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
            >
              {Object.values(KontaktTyp).map((t) => (
                <option key={t} value={t}>
                  {KONTAKT_TYP_META[t].label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="editVorname">
                Vorname
              </label>
              <input
                id="editVorname"
                type="text"
                value={editVorname}
                onChange={(e) => setEditVorname(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="editNachname">
                Nachname
              </label>
              <input
                id="editNachname"
                type="text"
                value={editNachname}
                onChange={(e) => setEditNachname(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted" htmlFor="editFirma">
              Firma (optional)
            </label>
            <input
              id="editFirma"
              type="text"
              value={editFirma}
              onChange={(e) => setEditFirma(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="editEmail">
                E-Mail
              </label>
              <input
                id="editEmail"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="editTelefon">
                Telefon
              </label>
              <input
                id="editTelefon"
                type="tel"
                value={editTelefon}
                onChange={(e) => setEditTelefon(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="editDebitorNr">
                Debitor-Nr. (optional)
              </label>
              <input
                id="editDebitorNr"
                type="text"
                value={editDebitorNr}
                onChange={(e) => setEditDebitorNr(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="editKreditorNr">
                Kreditor-Nr. (optional)
              </label>
              <input
                id="editKreditorNr"
                type="text"
                value={editKreditorNr}
                onChange={(e) => setEditKreditorNr(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              />
            </div>
          </div>

          {editError && <p className="text-sm text-red-500">{editError}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={updateKontakt.isPending}
              className="flex-1 rounded-lg bg-primary py-2 font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
            >
              {updateKontakt.isPending ? "Wird gespeichert…" : "Speichern"}
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

      <div className="space-y-8">
        <div>
          <h2 className="mb-3 text-lg font-semibold">Zugeordnete Objekte</h2>
          {zuordnungen && zuordnungen.length === 0 && (
            <p className="text-sm text-text-muted">Keinem Objekt zugeordnet.</p>
          )}
          {zuordnungen && zuordnungen.length > 0 && (
            <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
              {zuordnungen.map((z, i) => (
                <li key={i} className="flex items-center justify-between px-4 py-2.5">
                  <Link
                    href={`/objekte/${z.einheit.objekt.id}`}
                    className="flex items-center gap-2 hover:text-primary"
                  >
                    <Home size={15} className="text-text-muted" />
                    <span>{z.einheit.objekt.name}</span>
                    <span className="text-text-muted">· {z.einheit.name}</span>
                  </Link>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ROLLE_META[z.rolle].className}`}>
                    {ROLLE_META[z.rolle].label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DokumenteSection parent={{ path: "kontakte", id: kontaktId }} />
        <KommentareSection parent={{ path: "kontakte", id: kontaktId }} />
      </div>
    </>
  );
}
