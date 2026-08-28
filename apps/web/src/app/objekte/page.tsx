"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ObjektTyp } from "@maklerprogram/types";
import { useCurrentUser, useObjekte, useCreateObjekt } from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { AppHeader } from "@/components/AppHeader";

const OBJEKT_TYP_LABEL: Record<ObjektTyp, string> = {
  [ObjektTyp.WOHN_GESCHAEFTSHAUS]: "Wohn-/Geschäftshaus",
  [ObjektTyp.EINHEITEN]: "Einheiten",
  [ObjektTyp.EINFAMILIENHAUS]: "Einfamilienhaus",
  [ObjektTyp.WEG]: "WEG",
};

export default function ObjektePage() {
  const router = useRouter();
  const { isError: authError } = useCurrentUser();
  const { data: objekte, isLoading } = useObjekte();
  const createObjekt = useCreateObjekt();

  const [showForm, setShowForm] = useState(false);
  const [typ, setTyp] = useState<ObjektTyp>(ObjektTyp.EINFAMILIENHAUS);
  const [name, setName] = useState("");
  const [strasse, setStrasse] = useState("");
  const [hausnummer, setHausnummer] = useState("");
  const [plz, setPlz] = useState("");
  const [ort, setOrt] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authError) router.replace("/login");
  }, [authError, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createObjekt.mutateAsync({ typ, name, strasse, hausnummer, plz, ort });
      setName("");
      setStrasse("");
      setHausnummer("");
      setPlz("");
      setOrt("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Objekt konnte nicht angelegt werden.");
    }
  }

  return (
    <main className="min-h-screen bg-bg text-text">
      <AppHeader />

      <section className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Objekte</h1>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-fg transition hover:opacity-90"
          >
            {showForm ? "Abbrechen" : "Neues Objekt"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-lg border border-border bg-surface p-4">
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="typ">
                Typ
              </label>
              <select
                id="typ"
                value={typ}
                onChange={(e) => setTyp(e.target.value as ObjektTyp)}
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
              <label className="mb-1 block text-sm text-text-muted" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="mb-1 block text-sm text-text-muted" htmlFor="strasse">
                  Straße
                </label>
                <input
                  id="strasse"
                  type="text"
                  required
                  value={strasse}
                  onChange={(e) => setStrasse(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="hausnummer">
                  Nr.
                </label>
                <input
                  id="hausnummer"
                  type="text"
                  required
                  value={hausnummer}
                  onChange={(e) => setHausnummer(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="plz">
                  PLZ
                </label>
                <input
                  id="plz"
                  type="text"
                  required
                  value={plz}
                  onChange={(e) => setPlz(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm text-text-muted" htmlFor="ort">
                  Ort
                </label>
                <input
                  id="ort"
                  type="text"
                  required
                  value={ort}
                  onChange={(e) => setOrt(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={createObjekt.isPending}
              className="w-full rounded-lg bg-primary py-2 font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
            >
              {createObjekt.isPending ? "Wird angelegt…" : "Objekt anlegen"}
            </button>
          </form>
        )}

        {isLoading && <p className="text-text-muted">Lädt…</p>}

        {objekte && objekte.length === 0 && !showForm && (
          <p className="text-text-muted">Noch keine Objekte angelegt.</p>
        )}

        {objekte && objekte.length > 0 && (
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
            {objekte.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/objekte/${o.id}`}
                  className="flex items-center justify-between px-4 py-3 transition hover:bg-bg"
                >
                  <div>
                    <p className="font-medium">{o.name}</p>
                    <p className="text-sm text-text-muted">
                      {o.strasse} {o.hausnummer}, {o.plz} {o.ort}
                    </p>
                  </div>
                  <span className="rounded-full border border-border px-2.5 py-1 text-xs text-text-muted">
                    {OBJEKT_TYP_LABEL[o.typ]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
