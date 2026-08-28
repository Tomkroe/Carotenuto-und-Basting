"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Percent, Plus, Trash2, X } from "lucide-react";
import {
  useCurrentUser,
  useEigentuemerschaften,
  useCreateEigentuemerschaft,
  useDeleteEigentuemerschaft,
  useEinheitenFlat,
  useKontakte,
} from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { AppHeader } from "@/components/AppHeader";

function kontaktName(k: { vorname: string | null; nachname: string | null; firma: string | null }) {
  return [k.vorname, k.nachname].filter(Boolean).join(" ") || k.firma || "Unbenannt";
}

export default function EigentuemerschaftenPage() {
  const router = useRouter();
  const { isError: authError } = useCurrentUser();
  const { data: eigentuemerschaften, isLoading } = useEigentuemerschaften();
  const { data: einheiten } = useEinheitenFlat();
  const { data: kontakte } = useKontakte();
  const createEigentuemerschaft = useCreateEigentuemerschaft();
  const deleteEigentuemerschaft = useDeleteEigentuemerschaft();

  const [showForm, setShowForm] = useState(false);
  const [einheitId, setEinheitId] = useState("");
  const [eigentuemerId, setEigentuemerId] = useState("");
  const [hausgeldAnteil, setHausgeldAnteil] = useState("");
  const [anteilProzent, setAnteilProzent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    if (authError) router.replace("/login");
  }, [authError, router]);

  const einheitenByObjekt = useMemo(() => {
    const groups = new Map<string, { objektName: string; einheiten: typeof einheiten }>();
    for (const e of einheiten ?? []) {
      if (!groups.has(e.objekt.id)) groups.set(e.objekt.id, { objektName: e.objekt.name, einheiten: [] });
      groups.get(e.objekt.id)!.einheiten!.push(e);
    }
    return Array.from(groups.values());
  }, [einheiten]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createEigentuemerschaft.mutateAsync({
        einheitId,
        eigentuemerId,
        hausgeldAnteil: Number(hausgeldAnteil),
        anteilProzent: anteilProzent ? Number(anteilProzent) : undefined,
      });
      setEinheitId("");
      setEigentuemerId("");
      setHausgeldAnteil("");
      setAnteilProzent("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Eigentümerschaft konnte nicht angelegt werden.");
    }
  }

  return (
    <main className="min-h-screen bg-bg text-text">
      <AppHeader />

      <section className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Eigentümerschaften</h1>
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
                <Plus size={16} /> Neue Eigentümerschaft
              </>
            )}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-lg border border-border bg-surface p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="einheitId">
                  Einheit
                </label>
                <select
                  id="einheitId"
                  required
                  value={einheitId}
                  onChange={(e) => setEinheitId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                >
                  <option value="" disabled>
                    Wählen…
                  </option>
                  {einheitenByObjekt.map((group) => (
                    <optgroup key={group.objektName} label={group.objektName}>
                      {group.einheiten!.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="eigentuemerId">
                  Eigentümer
                </label>
                <select
                  id="eigentuemerId"
                  required
                  value={eigentuemerId}
                  onChange={(e) => setEigentuemerId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                >
                  <option value="" disabled>
                    Wählen…
                  </option>
                  {kontakte?.map((k) => (
                    <option key={k.id} value={k.id}>
                      {kontaktName(k)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="hausgeldAnteil">
                  Hausgeld-Anteil (€)
                </label>
                <input
                  id="hausgeldAnteil"
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={hausgeldAnteil}
                  onChange={(e) => setHausgeldAnteil(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="anteilProzent">
                  Miteigentumsanteil (%)
                </label>
                <input
                  id="anteilProzent"
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={anteilProzent}
                  onChange={(e) => setAnteilProzent(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={createEigentuemerschaft.isPending}
              className="w-full rounded-lg bg-primary py-2 font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
            >
              {createEigentuemerschaft.isPending ? "Wird angelegt…" : "Eigentümerschaft anlegen"}
            </button>
          </form>
        )}

        {isLoading && <p className="text-text-muted">Lädt…</p>}

        {eigentuemerschaften && eigentuemerschaften.length === 0 && !showForm && (
          <p className="text-text-muted">Noch keine Eigentümerschaften angelegt.</p>
        )}

        {eigentuemerschaften && eigentuemerschaften.length > 0 && (
          <ul className="space-y-2">
            {eigentuemerschaften.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                    <KeyRound size={18} />
                  </span>
                  <div>
                    <p className="font-medium">
                      {e.einheit.objekt.name} · {e.einheit.name}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-text-muted">
                      <span>{kontaktName(e.eigentuemer)}</span>
                      <span>{e.hausgeldAnteil.toFixed(2)} € Hausgeld</span>
                      {e.anteilProzent != null && (
                        <span className="flex items-center gap-0.5">
                          <Percent size={12} />
                          {e.anteilProzent.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {pendingDelete === e.id ? (
                  <div className="flex items-center gap-2 text-sm">
                    <button
                      onClick={() => {
                        deleteEigentuemerschaft.mutate(e.id);
                        setPendingDelete(null);
                      }}
                      className="rounded-full bg-red-500 px-3 py-1 text-white transition hover:opacity-90"
                    >
                      Ja, löschen
                    </button>
                    <button
                      onClick={() => setPendingDelete(null)}
                      className="rounded-full border border-border px-3 py-1 text-text-muted"
                    >
                      Abbrechen
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setPendingDelete(e.id)}
                    className="text-text-muted transition hover:text-red-500"
                    aria-label="Eigentümerschaft löschen"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
