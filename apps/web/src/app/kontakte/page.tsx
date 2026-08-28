"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  KeyRound,
  Mail,
  Phone,
  Plus,
  Sparkles,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { KontaktTyp } from "@maklerprogram/types";
import { useCurrentUser, useKontakte, useCreateKontakt } from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { AppHeader } from "@/components/AppHeader";

const KONTAKT_TYP_META: Record<
  KontaktTyp,
  { label: string; icon: typeof UserRound; className: string }
> = {
  [KontaktTyp.MIETER]: {
    label: "Mieter",
    icon: UserRound,
    className: "bg-blue-500/10 text-blue-500",
  },
  [KontaktTyp.EIGENTUEMER]: {
    label: "Eigentümer",
    icon: KeyRound,
    className: "bg-amber-500/10 text-amber-500",
  },
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
  [KontaktTyp.SONSTIGE]: {
    label: "Sonstige",
    icon: Sparkles,
    className: "bg-text-muted/10 text-text-muted",
  },
};

export default function KontaktePage() {
  const router = useRouter();
  const { isError: authError } = useCurrentUser();
  const { data: kontakte, isLoading } = useKontakte();
  const createKontakt = useCreateKontakt();

  const [showForm, setShowForm] = useState(false);
  const [typ, setTyp] = useState<KontaktTyp>(KontaktTyp.MIETER);
  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [firma, setFirma] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authError) router.replace("/login");
  }, [authError, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createKontakt.mutateAsync({
        typ,
        vorname: vorname || undefined,
        nachname: nachname || undefined,
        firma: firma || undefined,
        email: email || undefined,
        telefon: telefon || undefined,
      });
      setVorname("");
      setNachname("");
      setFirma("");
      setEmail("");
      setTelefon("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kontakt konnte nicht angelegt werden.");
    }
  }

  return (
    <main className="min-h-screen bg-bg text-text">
      <AppHeader />

      <section className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Kontakte</h1>
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
                <Plus size={16} /> Neuer Kontakt
              </>
            )}
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
                onChange={(e) => setTyp(e.target.value as KontaktTyp)}
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
                <label className="mb-1 block text-sm text-text-muted" htmlFor="vorname">
                  Vorname
                </label>
                <input
                  id="vorname"
                  type="text"
                  value={vorname}
                  onChange={(e) => setVorname(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="nachname">
                  Nachname
                </label>
                <input
                  id="nachname"
                  type="text"
                  value={nachname}
                  onChange={(e) => setNachname(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="firma">
                Firma (optional)
              </label>
              <input
                id="firma"
                type="text"
                value={firma}
                onChange={(e) => setFirma(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="email">
                  E-Mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="telefon">
                  Telefon
                </label>
                <input
                  id="telefon"
                  type="tel"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={createKontakt.isPending}
              className="w-full rounded-lg bg-primary py-2 font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
            >
              {createKontakt.isPending ? "Wird angelegt…" : "Kontakt anlegen"}
            </button>
          </form>
        )}

        {isLoading && <p className="text-text-muted">Lädt…</p>}

        {kontakte && kontakte.length === 0 && !showForm && (
          <p className="text-text-muted">Noch keine Kontakte angelegt.</p>
        )}

        {kontakte && kontakte.length > 0 && (
          <ul className="space-y-2">
            {kontakte.map((k) => {
              const meta = KONTAKT_TYP_META[k.typ];
              const Icon = meta.icon;
              const displayName =
                [k.vorname, k.nachname].filter(Boolean).join(" ") || k.firma || "Unbenannt";

              return (
                <li key={k.id}>
                  <Link
                    href={`/kontakte/${k.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition hover:border-primary"
                  >
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full ${meta.className}`}>
                      <Icon size={18} />
                    </span>
                    <div>
                      <p className="font-medium">{displayName}</p>
                      <div className="flex items-center gap-3 text-sm text-text-muted">
                        <span>{meta.label}</span>
                        {k.email && (
                          <span className="flex items-center gap-1">
                            <Mail size={13} /> {k.email}
                          </span>
                        )}
                        {k.telefon && (
                          <span className="flex items-center gap-1">
                            <Phone size={13} /> {k.telefon}
                          </span>
                        )}
                      </div>
                    </div>
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
