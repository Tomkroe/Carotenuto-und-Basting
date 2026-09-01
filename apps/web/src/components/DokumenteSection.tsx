"use client";

import { useState, ChangeEvent } from "react";
import { Upload, FileText, Download, Trash2, Paperclip } from "lucide-react";
import { DokumentKategorie } from "@maklerprogram/types";
import { useDokumente, useUploadDokument, useDeleteDokument, useUpdateDokument, DokumentParent } from "@/lib/hooks";
import { API_URL, ApiError } from "@/lib/api";
import { DOKUMENT_KATEGORIE_LABEL } from "@/lib/dokumentKategorien";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DokumenteSection({ parent }: { parent: DokumentParent }) {
  const { data: dokumente } = useDokumente(parent);
  const uploadDokument = useUploadDokument(parent);
  const deleteDokument = useDeleteDokument(parent);
  const updateDokument = useUpdateDokument(parent);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-lg font-semibold">
          <Paperclip size={18} />
          Dokumente
        </h2>
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
                <select
                  value={d.kategorie ?? ""}
                  onChange={(e) =>
                    updateDokument.mutate({
                      id: d.id,
                      data: { kategorie: (e.target.value || null) as DokumentKategorie | null },
                    })
                  }
                  className="rounded-lg border border-border bg-bg px-2 py-1 text-xs text-text-muted outline-none focus:border-primary"
                >
                  <option value="">Keine Kategorie</option>
                  {Object.values(DokumentKategorie).map((k) => (
                    <option key={k} value={k}>
                      {DOKUMENT_KATEGORIE_LABEL[k]}
                    </option>
                  ))}
                </select>
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
  );
}
