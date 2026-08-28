"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileEdit, Send, Plus, X } from "lucide-react";
import { NebenkostenStatus } from "@maklerprogram/types";
import { useCurrentUser, useNebenkostenabrechnungen, useCreateNebenkostenabrechnung, useObjekte } from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { AppHeader } from "@/components/AppHeader";

const STATUS_META: Record<NebenkostenStatus, { label: string; icon: typeof FileEdit; className: string }> = {
  [NebenkostenStatus.ENTWURF]: { label: "Entwurf", icon: FileEdit, className: "bg-blue-500/10 text-blue-500" },
  [NebenkostenStatus.VERSENDET]: {
    label: "Versendet",
    icon: Send,
    className: "bg-emerald-500/10 text-emerald-500",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE");
}

export default function NebenkostenabrechnungenPage() {
  const router = useRouter();
  const { isError: authError } = useCurrentUser();
  const { data: abrechnungen, isLoading } = useNebenkostenabrechnungen();
  const { data: objekte } = useObjekte();
  const createAbrechnung = useCreateNebenkostenabrechnung();

  const [showForm, setShowForm] = useState(false);
  const [objektId, setObjektId] = useState("");
  const [zeitraumVon, setZeitraumVon] = useState("");
  const [zeitraumBis, setZeitraumBis] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authError) router.replace("/login");
  }, [authError, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createAbrechnung.mutateAsync({ objektId, zeitraumVon, zeitraumBis });
      setObjektId("");
      setZeitraumVon("");
      setZeitraumBis("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Nebenkostenabrechnung konnte nicht angelegt werden.");
    }
  }

  return (
    <main className="min-h-screen bg-bg text-text">
      <AppHeader />

      <section className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Nebenkostenabrechnungen</h1>
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
                <Plus size={16} /> Neue Abrechnung
              </>
            )}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-lg border border-border bg-surface p-4">
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="objektId">
                Objekt
              </label>
              <select
                id="objektId"
                required
                value={objektId}
                onChange={(e) => setObjektId(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              >
                <option value="" disabled>
                  Wählen…
                </option>
                {objekte?.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="zeitraumVon">
                  Zeitraum von
                </label>
                <input
                  id="zeitraumVon"
                  type="date"
                  required
                  value={zeitraumVon}
                  onChange={(e) => setZeitraumVon(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="zeitraumBis">
                  Zeitraum bis
                </label>
                <input
                  id="zeitraumBis"
                  type="date"
                  required
                  value={zeitraumBis}
                  onChange={(e) => setZeitraumBis(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={createAbrechnung.isPending}
              className="w-full rounded-lg bg-primary py-2 font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
            >
              {createAbrechnung.isPending ? "Wird angelegt…" : "Abrechnung anlegen"}
            </button>
          </form>
        )}

        {isLoading && <p className="text-text-muted">Lädt…</p>}

        {abrechnungen && abrechnungen.length === 0 && !showForm && (
          <p className="text-text-muted">Noch keine Nebenkostenabrechnungen angelegt.</p>
        )}

        {abrechnungen && abrechnungen.length > 0 && (
          <ul className="space-y-2">
            {abrechnungen.map((a) => {
              const meta = STATUS_META[a.status];
              const Icon = meta.icon;
              return (
                <li key={a.id}>
                  <Link
                    href={`/nebenkostenabrechnungen/${a.id}`}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 transition hover:border-primary"
                  >
                    <div>
                      <p className="font-medium">{a.objekt.name}</p>
                      <p className="text-sm text-text-muted">
                        {formatDate(a.zeitraumVon)} – {formatDate(a.zeitraumBis)}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${meta.className}`}>
                      <Icon size={13} />
                      {meta.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
