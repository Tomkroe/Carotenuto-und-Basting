"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Building2, KeyRound, Mail, Phone, Sparkles, Trash2, UserRound, Wrench } from "lucide-react";
import { KontaktTyp } from "@maklerprogram/types";
import { useCurrentUser, useKontakt, useDeleteKontakt } from "@/lib/hooks";
import { AppHeader } from "@/components/AppHeader";
import { DokumenteSection } from "@/components/DokumenteSection";
import { KommentareSection } from "@/components/KommentareSection";

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

export default function KontaktDetailPage() {
  const params = useParams<{ id: string }>();
  const kontaktId = params.id;
  const router = useRouter();

  const { isError: authError } = useCurrentUser();
  const { data: kontakt, isLoading, isError: kontaktError } = useKontakt(kontaktId);
  const deleteKontakt = useDeleteKontakt();

  const [confirmDelete, setConfirmDelete] = useState(false);

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

  if (isLoading || !kontakt) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg text-text-muted">
        Lädt…
      </main>
    );
  }

  const meta = KONTAKT_TYP_META[kontakt.typ];
  const Icon = meta.icon;
  const displayName =
    [kontakt.vorname, kontakt.nachname].filter(Boolean).join(" ") || kontakt.firma || "Unbenannt";

  return (
    <main className="min-h-screen bg-bg text-text">
      <AppHeader />

      <section className="mx-auto max-w-3xl px-6 py-10">
        <nav className="mb-4 flex items-center gap-2 text-sm text-text-muted">
          <Link href="/kontakte" className="hover:text-primary">
            Kontakte
          </Link>
          <span>/</span>
          <span className="text-text">{displayName}</span>
        </nav>

        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className={`flex h-12 w-12 items-center justify-center rounded-full ${meta.className}`}>
              <Icon size={22} />
            </span>
            <div>
              <h1 className="text-2xl font-semibold">{displayName}</h1>
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

        <div className="space-y-8">
          <DokumenteSection parent={{ path: "kontakte", id: kontaktId }} />
          <KommentareSection parent={{ path: "kontakte", id: kontaktId }} />
        </div>
      </section>
    </main>
  );
}
