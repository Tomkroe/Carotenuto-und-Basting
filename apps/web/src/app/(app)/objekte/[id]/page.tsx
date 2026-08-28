"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { KeyRound, Pencil, UserRound } from "lucide-react";
import { MietvertragStatus, ObjektTyp } from "@maklerprogram/types";
import {
  useCurrentUser,
  useObjekt,
  useUpdateObjekt,
  useEinheiten,
  useCreateEinheit,
  useUpdateEinheit,
  useDeleteEinheit,
  useDeleteObjekt,
  useMietvertraege,
  useEigentuemerschaften,
} from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { DokumenteSection } from "@/components/DokumenteSection";

const OBJEKT_TYP_LABEL: Record<ObjektTyp, string> = {
  [ObjektTyp.WOHN_GESCHAEFTSHAUS]: "Wohn-/Geschäftshaus",
  [ObjektTyp.EINHEITEN]: "Einheiten",
  [ObjektTyp.EINFAMILIENHAUS]: "Einfamilienhaus",
  [ObjektTyp.WEG]: "WEG",
};

function kontaktName(k: { vorname: string | null; nachname: string | null; firma: string | null }) {
  return [k.vorname, k.nachname].filter(Boolean).join(" ") || k.firma || "Unbenannt";
}

export default function ObjektDetailPage() {
  const params = useParams<{ id: string }>();
  const objektId = params.id;
  const router = useRouter();

  const { isError: authError } = useCurrentUser();
  const { data: objekt, isLoading, isError: objektError } = useObjekt(objektId);
  const updateObjekt = useUpdateObjekt(objektId);
  const { data: einheiten, isLoading: einheitenLoading } = useEinheiten(objektId);
  const createEinheit = useCreateEinheit(objektId);
  const updateEinheit = useUpdateEinheit(objektId);
  const deleteEinheit = useDeleteEinheit(objektId);
  const deleteObjekt = useDeleteObjekt();
  const { data: mietvertraege } = useMietvertraege();
  const { data: eigentuemerschaften } = useEigentuemerschaften();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showEinheitForm, setShowEinheitForm] = useState(false);
  const [einheitName, setEinheitName] = useState("");
  const [einheitKategorie, setEinheitKategorie] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [editingObjekt, setEditingObjekt] = useState(false);
  const [editTyp, setEditTyp] = useState<ObjektTyp>(ObjektTyp.EINFAMILIENHAUS);
  const [editName, setEditName] = useState("");
  const [editStrasse, setEditStrasse] = useState("");
  const [editHausnummer, setEditHausnummer] = useState("");
  const [editPlz, setEditPlz] = useState("");
  const [editOrt, setEditOrt] = useState("");
  const [editKaltmiete, setEditKaltmiete] = useState("");
  const [editFlaeche, setEditFlaeche] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const [editingEinheitId, setEditingEinheitId] = useState<string | null>(null);
  const [editEinheitName, setEditEinheitName] = useState("");
  const [editEinheitKategorie, setEditEinheitKategorie] = useState("");

  useEffect(() => {
    if (authError) router.replace("/login");
  }, [authError, router]);

  useEffect(() => {
    if (objektError) router.replace("/objekte");
  }, [objektError, router]);

  async function handleDeleteObjekt() {
    await deleteObjekt.mutateAsync(objektId);
    router.replace("/objekte");
  }

  async function handleCreateEinheit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createEinheit.mutateAsync({ name: einheitName, kategorie: einheitKategorie });
      setEinheitName("");
      setEinheitKategorie("");
      setShowEinheitForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Einheit konnte nicht angelegt werden.");
    }
  }

  function startEditObjekt() {
    if (!objekt) return;
    setEditTyp(objekt.typ);
    setEditName(objekt.name);
    setEditStrasse(objekt.strasse);
    setEditHausnummer(objekt.hausnummer);
    setEditPlz(objekt.plz);
    setEditOrt(objekt.ort);
    setEditKaltmiete(objekt.kaltmiete != null ? String(objekt.kaltmiete) : "");
    setEditFlaeche(objekt.flaeche != null ? String(objekt.flaeche) : "");
    setEditError(null);
    setEditingObjekt(true);
  }

  async function handleSaveObjekt(e: FormEvent) {
    e.preventDefault();
    setEditError(null);
    try {
      await updateObjekt.mutateAsync({
        typ: editTyp,
        name: editName,
        strasse: editStrasse,
        hausnummer: editHausnummer,
        plz: editPlz,
        ort: editOrt,
        kaltmiete: editKaltmiete ? Number(editKaltmiete) : undefined,
        flaeche: editFlaeche ? Number(editFlaeche) : undefined,
      });
      setEditingObjekt(false);
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : "Objekt konnte nicht gespeichert werden.");
    }
  }

  function startEditEinheit(id: string, name: string, kategorie: string) {
    setEditingEinheitId(id);
    setEditEinheitName(name);
    setEditEinheitKategorie(kategorie);
  }

  async function handleSaveEinheit(id: string) {
    await updateEinheit.mutateAsync({ id, data: { name: editEinheitName, kategorie: editEinheitKategorie } });
    setEditingEinheitId(null);
  }

  if (isLoading || !objekt) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-text-muted">Lädt…</div>
    );
  }

  return (
          <section className="mx-auto max-w-3xl px-6 py-10">
        <nav className="mb-4 flex items-center gap-2 text-sm text-text-muted">
          <Link href="/objekte" className="hover:text-primary">
            Objekte
          </Link>
          <span>/</span>
          <span className="text-text">{objekt.name}</span>
        </nav>

        <div className="mb-6 flex items-start justify-between">
          {!editingObjekt ? (
            <div>
              <p className="text-sm text-text-muted">{OBJEKT_TYP_LABEL[objekt.typ]}</p>
              <h1 className="mt-1 text-2xl font-semibold">{objekt.name}</h1>
              <p className="mt-1 text-text-muted">
                {objekt.strasse} {objekt.hausnummer}, {objekt.plz} {objekt.ort}
              </p>
              {(objekt.kaltmiete != null || objekt.flaeche != null) && (
                <p className="mt-1 text-sm text-text-muted">
                  {objekt.kaltmiete != null && `${objekt.kaltmiete.toFixed(2)} € Kaltmiete`}
                  {objekt.kaltmiete != null && objekt.flaeche != null && " · "}
                  {objekt.flaeche != null && `${objekt.flaeche.toFixed(1)} m²`}
                </p>
              )}
            </div>
          ) : (
            <div className="w-full max-w-lg" />
          )}

          {!editingObjekt && (
            <div className="flex items-center gap-3">
              {!confirmDelete && (
                <button
                  onClick={startEditObjekt}
                  className="text-text-muted transition hover:text-primary"
                  aria-label="Objekt bearbeiten"
                >
                  <Pencil size={18} />
                </button>
              )}
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="rounded-full border border-border px-3 py-1.5 text-sm text-text-muted transition hover:border-red-500 hover:text-red-500"
                >
                  Löschen
                </button>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-text-muted">Wirklich löschen?</span>
                  <button
                    onClick={handleDeleteObjekt}
                    disabled={deleteObjekt.isPending}
                    className="rounded-full bg-red-500 px-3 py-1.5 text-white transition hover:opacity-90 disabled:opacity-50"
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

        {editingObjekt && (
          <form onSubmit={handleSaveObjekt} className="mb-6 space-y-4 rounded-lg border border-border bg-surface p-4">
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="editTyp">
                Typ
              </label>
              <select
                id="editTyp"
                value={editTyp}
                onChange={(e) => setEditTyp(e.target.value as ObjektTyp)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              >
                {Object.values(ObjektTyp).map((t) => (
                  <option key={t} value={t}>
                    {OBJEKT_TYP_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="editName">
                Name
              </label>
              <input
                id="editName"
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="editStrasse">
                  Straße
                </label>
                <input
                  id="editStrasse"
                  type="text"
                  required
                  value={editStrasse}
                  onChange={(e) => setEditStrasse(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="editHausnummer">
                  Nr.
                </label>
                <input
                  id="editHausnummer"
                  type="text"
                  required
                  value={editHausnummer}
                  onChange={(e) => setEditHausnummer(e.target.value)}
                  className="w-20 rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-[auto_1fr] gap-3">
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="editPlz">
                  PLZ
                </label>
                <input
                  id="editPlz"
                  type="text"
                  required
                  value={editPlz}
                  onChange={(e) => setEditPlz(e.target.value)}
                  className="w-24 rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="editOrt">
                  Ort
                </label>
                <input
                  id="editOrt"
                  type="text"
                  required
                  value={editOrt}
                  onChange={(e) => setEditOrt(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
            </div>
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
                  value={editKaltmiete}
                  onChange={(e) => setEditKaltmiete(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="editFlaeche">
                  Fläche (m²)
                </label>
                <input
                  id="editFlaeche"
                  type="number"
                  min={0}
                  step="0.1"
                  value={editFlaeche}
                  onChange={(e) => setEditFlaeche(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
            </div>

            {editError && <p className="text-sm text-red-500">{editError}</p>}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updateObjekt.isPending}
                className="flex-1 rounded-lg bg-primary py-2 font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
              >
                {updateObjekt.isPending ? "Wird gespeichert…" : "Speichern"}
              </button>
              <button
                type="button"
                onClick={() => setEditingObjekt(false)}
                className="rounded-lg border border-border px-4 py-2 text-text-muted"
              >
                Abbrechen
              </button>
            </div>
          </form>
        )}

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Einheiten</h2>
          <button
            onClick={() => setShowEinheitForm((v) => !v)}
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-fg transition hover:opacity-90"
          >
            {showEinheitForm ? "Abbrechen" : "Neue Einheit"}
          </button>
        </div>

        {showEinheitForm && (
          <form
            onSubmit={handleCreateEinheit}
            className="mb-6 space-y-4 rounded-lg border border-border bg-surface p-4"
          >
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="einheitName">
                Name
              </label>
              <input
                id="einheitName"
                type="text"
                required
                value={einheitName}
                onChange={(e) => setEinheitName(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                placeholder="z.B. Wohnung 1. OG links"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="einheitKategorie">
                Kategorie
              </label>
              <input
                id="einheitKategorie"
                type="text"
                required
                value={einheitKategorie}
                onChange={(e) => setEinheitKategorie(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                placeholder="z.B. Wohnung, Gewerbe, Stellplatz"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={createEinheit.isPending}
              className="w-full rounded-lg bg-primary py-2 font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
            >
              {createEinheit.isPending ? "Wird angelegt…" : "Einheit anlegen"}
            </button>
          </form>
        )}

        {einheitenLoading && <p className="text-text-muted">Lädt…</p>}

        {einheiten && einheiten.length === 0 && !showEinheitForm && (
          <p className="text-text-muted">Noch keine Einheiten angelegt.</p>
        )}

        {einheiten && einheiten.length > 0 && (
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
            {einheiten.map((e) => {
              const mietvertrag = mietvertraege?.find(
                (m) => m.einheit.id === e.id && m.status === MietvertragStatus.AKTIV,
              );
              const eigentuemer = eigentuemerschaften?.filter((w) => w.einheit.id === e.id) ?? [];

              if (editingEinheitId === e.id) {
                return (
                  <li key={e.id} className="flex items-center gap-2 px-4 py-3">
                    <input
                      type="text"
                      value={editEinheitName}
                      onChange={(ev) => setEditEinheitName(ev.target.value)}
                      className="flex-1 rounded-lg border border-border bg-bg px-2 py-1 text-sm outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      value={editEinheitKategorie}
                      onChange={(ev) => setEditEinheitKategorie(ev.target.value)}
                      className="w-32 rounded-lg border border-border bg-bg px-2 py-1 text-sm outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => handleSaveEinheit(e.id)}
                      disabled={updateEinheit.isPending}
                      className="rounded-full bg-primary px-3 py-1 text-sm text-primary-fg transition hover:opacity-90 disabled:opacity-50"
                    >
                      Speichern
                    </button>
                    <button
                      onClick={() => setEditingEinheitId(null)}
                      className="rounded-full border border-border px-3 py-1 text-sm text-text-muted"
                    >
                      Abbrechen
                    </button>
                  </li>
                );
              }

              return (
                <li key={e.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-medium">{e.name}</p>
                    <p className="text-sm text-text-muted">{e.kategorie}</p>
                    {(mietvertrag || eigentuemer.length > 0) && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                        {mietvertrag && (
                          <span className="flex items-center gap-1">
                            <UserRound size={12} /> {kontaktName(mietvertrag.mieter)}
                          </span>
                        )}
                        {eigentuemer.map((w) => (
                          <span key={w.id} className="flex items-center gap-1">
                            <KeyRound size={12} /> {kontaktName(w.eigentuemer)}
                            {w.anteilProzent != null && ` (${w.anteilProzent.toFixed(0)}%)`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => startEditEinheit(e.id, e.name, e.kategorie)}
                      className="text-text-muted transition hover:text-primary"
                      aria-label="Einheit bearbeiten"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => deleteEinheit.mutate(e.id)}
                      className="text-sm text-text-muted transition hover:text-red-500"
                    >
                      Entfernen
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-8">
          <DokumenteSection parent={{ path: "objekte", id: objektId }} />
        </div>
      </section>
  );
}
