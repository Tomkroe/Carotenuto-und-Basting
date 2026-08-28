"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { KeyRound, UserRound } from "lucide-react";
import { MietvertragStatus, ObjektTyp } from "@maklerprogram/types";
import {
  useCurrentUser,
  useObjekt,
  useEinheiten,
  useCreateEinheit,
  useDeleteEinheit,
  useDeleteObjekt,
  useMietvertraege,
  useEigentuemerschaften,
} from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { AppHeader } from "@/components/AppHeader";
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
  const { data: einheiten, isLoading: einheitenLoading } = useEinheiten(objektId);
  const createEinheit = useCreateEinheit(objektId);
  const deleteEinheit = useDeleteEinheit(objektId);
  const deleteObjekt = useDeleteObjekt();
  const { data: mietvertraege } = useMietvertraege();
  const { data: eigentuemerschaften } = useEigentuemerschaften();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showEinheitForm, setShowEinheitForm] = useState(false);
  const [einheitName, setEinheitName] = useState("");
  const [einheitKategorie, setEinheitKategorie] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  if (isLoading || !objekt) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg text-text-muted">
        Lädt…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg text-text">
      <AppHeader />

      <section className="mx-auto max-w-3xl px-6 py-10">
        <nav className="mb-4 flex items-center gap-2 text-sm text-text-muted">
          <Link href="/objekte" className="hover:text-primary">
            Objekte
          </Link>
          <span>/</span>
          <span className="text-text">{objekt.name}</span>
        </nav>

        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-sm text-text-muted">{OBJEKT_TYP_LABEL[objekt.typ]}</p>
            <h1 className="mt-1 text-2xl font-semibold">{objekt.name}</h1>
            <p className="mt-1 text-text-muted">
              {objekt.strasse} {objekt.hausnummer}, {objekt.plz} {objekt.ort}
            </p>
          </div>

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
                  <button
                    onClick={() => deleteEinheit.mutate(e.id)}
                    className="text-sm text-text-muted transition hover:text-red-500"
                  >
                    Entfernen
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-8">
          <DokumenteSection parent={{ path: "objekte", id: objektId }} />
        </div>
      </section>
    </main>
  );
}
