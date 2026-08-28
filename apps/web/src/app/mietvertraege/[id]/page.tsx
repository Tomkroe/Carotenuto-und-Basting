"use client";

import { useEffect, useState, ChangeEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CalendarClock, CheckCircle2, Archive, Trash2, Upload, FileText, Download } from "lucide-react";
import { MietvertragStatus } from "@maklerprogram/types";
import {
  useCurrentUser,
  useMietvertrag,
  useUpdateMietvertrag,
  useDeleteMietvertrag,
  useDokumente,
  useUploadDokument,
  useDeleteDokument,
} from "@/lib/hooks";
import { API_URL, ApiError } from "@/lib/api";
import { AppHeader } from "@/components/AppHeader";

const STATUS_META: Record<MietvertragStatus, { label: string; icon: typeof CalendarClock; className: string }> = {
  [MietvertragStatus.GEPLANT]: {
    label: "Geplant",
    icon: CalendarClock,
    className: "bg-blue-500/10 text-blue-500",
  },
  [MietvertragStatus.AKTIV]: {
    label: "Aktiv",
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-500",
  },
  [MietvertragStatus.BEENDET]: {
    label: "Beendet",
    icon: Archive,
    className: "bg-text-muted/10 text-text-muted",
  },
};

function kontaktName(k: { vorname: string | null; nachname: string | null; firma: string | null }) {
  return [k.vorname, k.nachname].filter(Boolean).join(" ") || k.firma || "Unbenannt";
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MietvertragDetailPage() {
  const params = useParams<{ id: string }>();
  const mietvertragId = params.id;
  const router = useRouter();

  const { isError: authError } = useCurrentUser();
  const { data: mietvertrag, isLoading, isError: mietvertragError } = useMietvertrag(mietvertragId);
  const updateMietvertrag = useUpdateMietvertrag(mietvertragId);
  const deleteMietvertrag = useDeleteMietvertrag();

  const { data: dokumente } = useDokumente(mietvertragId);
  const uploadDokument = useUploadDokument(mietvertragId);
  const deleteDokument = useDeleteDokument(mietvertragId);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (authError) router.replace("/login");
  }, [authError, router]);

  useEffect(() => {
    if (mietvertragError) router.replace("/mietvertraege");
  }, [mietvertragError, router]);

  async function handleDelete() {
    await deleteMietvertrag.mutateAsync(mietvertragId);
    router.replace("/mietvertraege");
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError(null);
    try {
      await uploadDokument.mutateAsync(file);
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : "Upload fehlgeschlagen.");
    }
  }

  if (isLoading || !mietvertrag) {
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
          <Link href="/mietvertraege" className="hover:text-primary">
            Mietverträge
          </Link>
          <span>/</span>
          <span className="text-text">
            {mietvertrag.einheit.objekt.name} · {mietvertrag.einheit.name}
          </span>
        </nav>

        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {mietvertrag.einheit.objekt.name} · {mietvertrag.einheit.name}
            </h1>
            <p className="mt-1 text-text-muted">Mieter: {kontaktName(mietvertrag.mieter)}</p>
            <p className="mt-1 text-text-muted">
              {mietvertrag.kaltmiete.toFixed(2)} € kalt
              {mietvertrag.nebenkostenVorauszahlung > 0 &&
                ` · ${mietvertrag.nebenkostenVorauszahlung.toFixed(2)} € Nebenkosten`}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Beginn {new Date(mietvertrag.beginn).toLocaleDateString("de-DE")}
              {mietvertrag.ende && ` · Ende ${new Date(mietvertrag.ende).toLocaleDateString("de-DE")}`}
            </p>
          </div>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-text-muted transition hover:text-red-500"
              aria-label="Mietvertrag löschen"
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

        <div className="mb-8 flex gap-2">
          {Object.values(MietvertragStatus).map((s) => {
            const meta = STATUS_META[s];
            const Icon = meta.icon;
            const active = mietvertrag.status === s;
            return (
              <button
                key={s}
                onClick={() => updateMietvertrag.mutate({ status: s })}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition ${
                  active ? meta.className : "border border-border text-text-muted hover:border-primary"
                }`}
              >
                <Icon size={14} />
                {meta.label}
              </button>
            );
          })}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Dokumente</h2>
            <label className="flex cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-fg transition hover:opacity-90">
              <Upload size={15} />
              {uploadDokument.isPending ? "Wird hochgeladen…" : "Hochladen"}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
                disabled={uploadDokument.isPending}
              />
            </label>
          </div>

          {uploadError && <p className="mb-3 text-sm text-red-500">{uploadError}</p>}

          {dokumente && dokumente.length === 0 && <p className="text-sm text-text-muted">Keine Dokumente.</p>}

          {dokumente && dokumente.length > 0 && (
            <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
              {dokumente.map((d) => (
                <li key={d.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <FileText size={17} className="text-text-muted" />
                    <div>
                      <p className="text-sm">{d.dateiname}</p>
                      <p className="text-xs text-text-muted">
                        {formatSize(d.groesseBytes)} · {d.hochgeladenVon.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={`${API_URL}/dokumente/${d.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-muted transition hover:text-primary"
                      aria-label="Herunterladen"
                    >
                      <Download size={16} />
                    </a>
                    <button
                      onClick={() => deleteDokument.mutate(d.id)}
                      className="text-text-muted transition hover:text-red-500"
                      aria-label="Dokument löschen"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
