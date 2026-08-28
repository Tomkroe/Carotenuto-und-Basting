"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Zap, Flame, Droplet, Star, Trash2, Gauge } from "lucide-react";
import { ZaehlerTyp } from "@maklerprogram/types";
import {
  useCurrentUser,
  useZaehler,
  useDeleteZaehler,
  useZaehlerstaende,
  useCreateZaehlerstand,
  useDeleteZaehlerstand,
} from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { AppHeader } from "@/components/AppHeader";

const TYP_META: Record<ZaehlerTyp, { label: string; icon: typeof Zap; className: string }> = {
  [ZaehlerTyp.STROM]: { label: "Strom", icon: Zap, className: "bg-amber-500/10 text-amber-500" },
  [ZaehlerTyp.GAS]: { label: "Gas", icon: Flame, className: "bg-orange-500/10 text-orange-500" },
  [ZaehlerTyp.WASSER]: { label: "Wasser", icon: Droplet, className: "bg-blue-500/10 text-blue-500" },
};

export default function ZaehlerDetailPage() {
  const params = useParams<{ id: string }>();
  const zaehlerId = params.id;
  const router = useRouter();

  const { isError: authError } = useCurrentUser();
  const { data: zaehler, isLoading, isError: zaehlerError } = useZaehler(zaehlerId);
  const deleteZaehler = useDeleteZaehler();

  const { data: zaehlerstaende } = useZaehlerstaende(zaehlerId);
  const createZaehlerstand = useCreateZaehlerstand(zaehlerId);
  const deleteZaehlerstand = useDeleteZaehlerstand(zaehlerId);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [datum, setDatum] = useState("");
  const [wert, setWert] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authError) router.replace("/login");
  }, [authError, router]);

  useEffect(() => {
    if (zaehlerError) router.replace("/zaehler");
  }, [zaehlerError, router]);

  async function handleDelete() {
    await deleteZaehler.mutateAsync(zaehlerId);
    router.replace("/zaehler");
  }

  async function handleAddZaehlerstand(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createZaehlerstand.mutateAsync({ datum, wert: Number(wert) });
      setDatum("");
      setWert("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Zählerstand konnte nicht angelegt werden.");
    }
  }

  if (isLoading || !zaehler) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg text-text-muted">
        Lädt…
      </main>
    );
  }

  const meta = TYP_META[zaehler.typ];
  const Icon = meta.icon;

  return (
    <main className="min-h-screen bg-bg text-text">
      <AppHeader />

      <section className="mx-auto max-w-3xl px-6 py-10">
        <nav className="mb-4 flex items-center gap-2 text-sm text-text-muted">
          <Link href="/zaehler" className="hover:text-primary">
            Zähler
          </Link>
          <span>/</span>
          <span className="text-text">{zaehler.zaehlernummer}</span>
        </nav>

        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className={`flex h-12 w-12 items-center justify-center rounded-full ${meta.className}`}>
              <Icon size={22} />
            </span>
            <div>
              <h1 className="flex items-center gap-1.5 text-2xl font-semibold">
                {zaehler.zaehlernummer}
                {zaehler.hauptzaehler && <Star size={16} className="text-amber-500" />}
              </h1>
              <p className="text-text-muted">
                {meta.label}
                {zaehler.einheit && ` · ${zaehler.einheit.objekt.name} · ${zaehler.einheit.name}`}
                {!zaehler.einheit && zaehler.objekt && ` · ${zaehler.objekt.name}`}
                {zaehler.versorger && ` · ${zaehler.versorger}`}
                {zaehler.vertragsNr && ` · Vertrag ${zaehler.vertragsNr}`}
              </p>
            </div>
          </div>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-text-muted transition hover:text-red-500"
              aria-label="Zähler löschen"
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

        <h2 className="mb-3 flex items-center gap-1.5 text-lg font-semibold">
          <Gauge size={18} />
          Zählerstände
        </h2>

        <form onSubmit={handleAddZaehlerstand} className="mb-4 flex items-end gap-2">
          <div>
            <label className="mb-1 block text-sm text-text-muted" htmlFor="datum">
              Datum
            </label>
            <input
              id="datum"
              type="date"
              required
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted" htmlFor="wert">
              Stand
            </label>
            <input
              id="wert"
              type="number"
              min={0}
              step="0.001"
              required
              value={wert}
              onChange={(e) => setWert(e.target.value)}
              className="w-32 rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={createZaehlerstand.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
          >
            Erfassen
          </button>
        </form>

        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

        {zaehlerstaende && zaehlerstaende.length === 0 && <p className="text-sm text-text-muted">Keine Zählerstände erfasst.</p>}

        {zaehlerstaende && zaehlerstaende.length > 0 && (
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
            {zaehlerstaende.map((z) => (
              <li key={z.id} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm">{new Date(z.datum).toLocaleDateString("de-DE")}</span>
                <span className="text-sm font-medium">{z.wert.toLocaleString("de-DE")}</span>
                <button
                  onClick={() => deleteZaehlerstand.mutate(z.id)}
                  className="text-text-muted transition hover:text-red-500"
                  aria-label="Zählerstand löschen"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
