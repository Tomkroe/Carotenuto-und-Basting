"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus, X } from "lucide-react";
import { ObjektTyp } from "@maklerprogram/types";
import { useCurrentUser, useObjekte, useCreateObjekt, useEinheitenFlat } from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { SearchInput } from "@/components/SearchInput";
import { DataTable } from "@/components/DataTable";

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
  const { data: einheiten } = useEinheitenFlat();
  const createObjekt = useCreateObjekt();

  const [showForm, setShowForm] = useState(false);
  const [typ, setTyp] = useState<ObjektTyp>(ObjektTyp.EINFAMILIENHAUS);
  const [name, setName] = useState("");
  const [strasse, setStrasse] = useState("");
  const [hausnummer, setHausnummer] = useState("");
  const [plz, setPlz] = useState("");
  const [ort, setOrt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (authError) router.replace("/login");
  }, [authError, router]);

  const einheitenProObjekt = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of einheiten ?? []) {
      counts.set(e.objektId, (counts.get(e.objektId) ?? 0) + 1);
    }
    return counts;
  }, [einheiten]);

  const gefilterteObjekte = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return objekte ?? [];
    return (objekte ?? []).filter((o) =>
      [o.name, o.strasse, o.ort].some((f) => f.toLowerCase().includes(query)),
    );
  }, [objekte, search]);

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
    <section className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Objekte</h1>
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
              <Plus size={16} /> Neues Objekt
            </>
          )}
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-2">
        <StatCard value={objekte?.length ?? 0} label="Objekte" />
        <StatCard value={einheiten?.length ?? 0} label="Einheiten" />
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

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Objekte durchsuchen…" />
      </div>

      {isLoading && <p className="text-text-muted">Lädt…</p>}

      {objekte && objekte.length === 0 && !showForm && (
        <p className="text-text-muted">Noch keine Objekte angelegt.</p>
      )}

      {gefilterteObjekte.length > 0 && (
        <DataTable
          columns={[
            { key: "objekt", header: "Objekt" },
            { key: "typ", header: "Typ" },
            { key: "einheiten", header: "Einheiten" },
          ]}
        >
          {gefilterteObjekte.map((o) => (
            <tr
              key={o.id}
              onClick={() => router.push(`/objekte/${o.id}`)}
              className="cursor-pointer transition hover:bg-bg"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Building2 size={15} />
                  </span>
                  <div>
                    <p className="font-medium">{o.name}</p>
                    <p className="text-xs text-text-muted">
                      {o.strasse} {o.hausnummer}, {o.plz} {o.ort}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-text-muted">{OBJEKT_TYP_LABEL[o.typ]}</td>
              <td className="px-4 py-3 text-text-muted">{einheitenProObjekt.get(o.id) ?? 0}</td>
            </tr>
          ))}
        </DataTable>
      )}
    </section>
  );
}
