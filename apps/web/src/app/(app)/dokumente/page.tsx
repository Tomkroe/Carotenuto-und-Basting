"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ClipboardList,
  Download,
  FileSignature,
  FileText,
  Receipt,
  Trash2,
  Users,
} from "lucide-react";
import { useCurrentUser, useAlleDokumente, useDeleteDokumentGlobal } from "@/lib/hooks";
import { API_URL } from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { SearchInput } from "@/components/SearchInput";
import { DataTable } from "@/components/DataTable";
import type { DokumentMitZuordnung } from "@maklerprogram/types";

const ZUORDNUNG_ICON: Record<NonNullable<DokumentMitZuordnung["zugeordnetTyp"]>, typeof Building2> = {
  objekt: Building2,
  vorgang: ClipboardList,
  mietvertrag: FileSignature,
  nebenkostenabrechnung: Receipt,
  kontakt: Users,
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DokumentePage() {
  const router = useRouter();
  const { isError: authError } = useCurrentUser();
  const { data: dokumente, isLoading } = useAlleDokumente();
  const deleteDokument = useDeleteDokumentGlobal();

  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    if (authError) router.replace("/login");
  }, [authError, router]);

  const gefilterteDokumente = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return dokumente ?? [];
    return (dokumente ?? []).filter((d) =>
      [d.dateiname, d.zugeordnetZu, d.hochgeladenVon.name].filter(Boolean).some((f) => f!.toLowerCase().includes(query)),
    );
  }, [dokumente, search]);

  const ohneZuordnung = (dokumente ?? []).filter((d) => !d.zugeordnetZu);
  const gesamtgroesse = (dokumente ?? []).reduce((sum, d) => sum + d.groesseBytes, 0);

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dokumente</h1>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <StatCard value={dokumente?.length ?? 0} label="Dokumente" />
        <StatCard value={formatSize(gesamtgroesse)} label="Gesamtgröße" />
        <StatCard
          value={ohneZuordnung.length}
          label="Ohne Zuordnung"
          tone={ohneZuordnung.length > 0 ? "warning" : "default"}
        />
      </div>

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Dokumente durchsuchen…" />
      </div>

      {isLoading && <p className="text-text-muted">Lädt…</p>}

      {dokumente && dokumente.length === 0 && <p className="text-text-muted">Noch keine Dokumente hochgeladen.</p>}

      {gefilterteDokumente.length > 0 && (
        <DataTable
          columns={[
            { key: "dokument", header: "Dokument" },
            { key: "zuordnung", header: "Zugeordnet zu" },
            { key: "hochgeladen", header: "Hochgeladen von" },
            { key: "aktionen", header: "" },
          ]}
        >
          {gefilterteDokumente.map((d) => {
            const ZuordnungIcon = d.zugeordnetTyp ? ZUORDNUNG_ICON[d.zugeordnetTyp] : null;
            return (
              <tr key={d.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <FileText size={17} className="shrink-0 text-text-muted" />
                    <div>
                      <p className="text-sm font-medium">{d.dateiname}</p>
                      <p className="text-xs text-text-muted">
                        {formatSize(d.groesseBytes)} · {new Date(d.createdAt).toLocaleDateString("de-DE")}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {d.zugeordnetZu ? (
                    <span className="flex items-center gap-1.5">
                      {ZuordnungIcon && <ZuordnungIcon size={13} />}
                      {d.zugeordnetZu}
                    </span>
                  ) : (
                    <span className="text-amber-500">Ohne Zuordnung</span>
                  )}
                </td>
                <td className="px-4 py-3 text-text-muted">{d.hochgeladenVon.name}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <a
                      href={`${API_URL}/dokumente/${d.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-muted transition hover:text-primary"
                      aria-label="Herunterladen"
                    >
                      <Download size={16} />
                    </a>
                    {pendingDelete === d.id ? (
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          onClick={() => {
                            deleteDokument.mutate(d.id);
                            setPendingDelete(null);
                          }}
                          className="rounded-full bg-red-500 px-2.5 py-1 text-white transition hover:opacity-90"
                        >
                          Löschen
                        </button>
                        <button
                          onClick={() => setPendingDelete(null)}
                          className="rounded-full border border-border px-2.5 py-1 text-text-muted"
                        >
                          Abbrechen
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setPendingDelete(d.id)}
                        className="text-text-muted transition hover:text-red-500"
                        aria-label="Dokument löschen"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </DataTable>
      )}
    </section>
  );
}
