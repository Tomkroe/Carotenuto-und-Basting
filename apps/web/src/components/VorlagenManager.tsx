"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { FilePlus2, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import {
  useVorgangVorlagen,
  useCreateVorgangVorlage,
  useUpdateVorgangVorlage,
  useDeleteVorgangVorlage,
  useCreateVorgang,
  useLabels,
} from "@/lib/hooks";
import { apiFetch, ApiError } from "@/lib/api";
import { labelStyle } from "@/lib/labelStyle";
import type { VorgangVorlage } from "@maklerprogram/types";

export function VorlagenManager() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: vorlagen, isLoading } = useVorgangVorlagen();
  const { data: alleLabels } = useLabels();
  const createVorlage = useCreateVorgangVorlage();
  const updateVorlage = useUpdateVorgangVorlage();
  const deleteVorlage = useDeleteVorgangVorlage();
  const createVorgang = useCreateVorgang();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titel, setTitel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [creatingFromId, setCreatingFromId] = useState<string | null>(null);

  function resetForm() {
    setTitel("");
    setBeschreibung("");
    setLabelIds([]);
    setError(null);
    setEditingId(null);
  }

  function startCreate() {
    resetForm();
    setShowForm(true);
  }

  function startEdit(v: VorgangVorlage) {
    setEditingId(v.id);
    setTitel(v.titel);
    setBeschreibung(v.beschreibung ?? "");
    setLabelIds(v.labels.map((l) => l.id));
    setError(null);
    setShowForm(true);
  }

  function toggleLabel(id: string) {
    setLabelIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const data = { titel, beschreibung: beschreibung || undefined, labelIds };
      if (editingId) {
        await updateVorlage.mutateAsync({ id: editingId, data });
      } else {
        await createVorlage.mutateAsync(data);
      }
      setShowForm(false);
      resetForm();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Vorlage konnte nicht gespeichert werden.");
    }
  }

  async function handleUseVorlage(v: VorgangVorlage) {
    setCreatingFromId(v.id);
    try {
      const neuerVorgang = await createVorgang.mutateAsync({
        titel: v.titel,
        beschreibung: v.beschreibung ?? undefined,
      });
      for (const label of v.labels) {
        await apiFetch<void>(`/vorgaenge/${neuerVorgang.id}/labels/${label.id}`, { method: "POST" });
      }
      queryClient.invalidateQueries({ queryKey: ["vorgaenge"] });
      router.push(`/vorgaenge/${neuerVorgang.id}`);
    } finally {
      setCreatingFromId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-text-muted">
          Vorlagen für wiederkehrende Vorgänge — mit einem Klick einen neuen Vorgang daraus erstellen.
        </p>
        <button
          onClick={startCreate}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-fg transition hover:opacity-90"
        >
          <Plus size={16} /> Neue Vorlage
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-border bg-surface p-4">
          <div>
            <label className="mb-1 block text-sm text-text-muted" htmlFor="vorlageTitel">
              Titel
            </label>
            <input
              id="vorlageTitel"
              type="text"
              required
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted" htmlFor="vorlageBeschreibung">
              Beschreibung (optional)
            </label>
            <textarea
              id="vorlageBeschreibung"
              rows={2}
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          {alleLabels && alleLabels.length > 0 && (
            <div>
              <p className="mb-1.5 flex items-center gap-1 text-sm text-text-muted">
                <Tag size={13} /> Labels (optional)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {alleLabels.map((l) => {
                  const active = labelIds.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => toggleLabel(l.id)}
                      className="rounded-full px-2.5 py-1 text-xs font-medium transition"
                      style={{ ...labelStyle(l.farbe), opacity: active ? 1 : 0.4 }}
                    >
                      {l.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createVorlage.isPending || updateVorlage.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
            >
              {editingId ? "Speichern" : "Vorlage anlegen"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {isLoading && <p className="text-text-muted">Lädt…</p>}
      {vorlagen && vorlagen.length === 0 && !showForm && (
        <p className="text-text-muted">Noch keine Vorlagen angelegt.</p>
      )}

      {vorlagen && vorlagen.length > 0 && (
        <div className="divide-y divide-border rounded-lg border border-border bg-surface">
          {vorlagen.map((v) => (
            <div key={v.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="font-medium">{v.titel}</p>
                {v.beschreibung && <p className="mt-0.5 text-sm text-text-muted">{v.beschreibung}</p>}
                {v.labels.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {v.labels.map((l) => (
                      <span
                        key={l.id}
                        className="rounded-full px-2 py-0.5 text-xs font-medium"
                        style={labelStyle(l.farbe)}
                      >
                        {l.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => handleUseVorlage(v)}
                  disabled={creatingFromId === v.id}
                  className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
                >
                  <FilePlus2 size={13} />
                  {creatingFromId === v.id ? "Wird erstellt…" : "Vorgang erstellen"}
                </button>
                <button
                  onClick={() => startEdit(v)}
                  aria-label={`Vorlage ${v.titel} bearbeiten`}
                  className="rounded-lg p-1.5 text-text-muted transition hover:bg-bg hover:text-text"
                >
                  <Pencil size={15} />
                </button>
                {confirmDeleteId === v.id ? (
                  <>
                    <button
                      onClick={() => deleteVorlage.mutate(v.id)}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-500/10"
                    >
                      Ja
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="rounded-lg px-2 py-1 text-xs text-text-muted hover:bg-bg"
                    >
                      Abbrechen
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(v.id)}
                    aria-label={`Vorlage ${v.titel} löschen`}
                    className="rounded-lg p-1.5 text-text-muted transition hover:bg-bg hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
