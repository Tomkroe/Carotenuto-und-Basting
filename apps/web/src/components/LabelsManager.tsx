"use client";

import { useState, FormEvent } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useLabels, useCreateLabel, useUpdateLabel, useDeleteLabel } from "@/lib/hooks";
import { labelStyle } from "@/lib/labelStyle";
import { LABEL_COLORS } from "@/lib/labelColors";
import { ApiError } from "@/lib/api";

export function LabelsManager() {
  const { data: labels, isLoading } = useLabels();
  const createLabel = useCreateLabel();
  const updateLabel = useUpdateLabel();
  const deleteLabel = useDeleteLabel();

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(LABEL_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setError(null);
    try {
      await createLabel.mutateAsync({ name: newName.trim(), farbe: newColor });
      setNewName("");
      setNewColor(LABEL_COLORS[0]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Label konnte nicht angelegt werden.");
    }
  }

  function startEdit(l: { id: string; name: string; farbe: string }) {
    setEditingId(l.id);
    setEditName(l.name);
    setEditColor(l.farbe);
    setConfirmDeleteId(null);
  }

  async function handleSaveEdit(id: string) {
    if (!editName.trim()) return;
    await updateLabel.mutateAsync({ id, data: { name: editName.trim(), farbe: editColor } });
    setEditingId(null);
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleCreate}
        className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-3"
      >
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Neues Label…"
          className="min-w-[160px] flex-1 rounded-lg border border-border bg-bg px-3 py-1.5 text-sm outline-none focus:border-primary"
        />
        <div className="flex items-center gap-1">
          {LABEL_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setNewColor(c)}
              aria-label={`Farbe ${c}`}
              className={`h-5 w-5 rounded-full transition ${
                newColor === c ? "ring-2 ring-primary ring-offset-2 ring-offset-surface" : ""
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <button
          type="submit"
          disabled={createLabel.isPending}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
        >
          <Plus size={15} /> Anlegen
        </button>
      </form>
      {error && <p className="text-sm text-red-500">{error}</p>}

      {isLoading && <p className="text-text-muted">Lädt…</p>}
      {labels && labels.length === 0 && <p className="text-text-muted">Noch keine Labels angelegt.</p>}

      {labels && labels.length > 0 && (
        <div className="divide-y divide-border rounded-lg border border-border bg-surface">
          {labels.map((l) => {
            const usage = (l.vorgangCount ?? 0) + (l.todoCount ?? 0);
            return (
              <div key={l.id} className="flex items-center gap-3 px-4 py-3">
                {editingId === l.id ? (
                  <>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                      className="flex-1 rounded-lg border border-border bg-bg px-3 py-1.5 text-sm outline-none focus:border-primary"
                    />
                    <div className="flex items-center gap-1">
                      {LABEL_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setEditColor(c)}
                          aria-label={`Farbe ${c}`}
                          className={`h-5 w-5 rounded-full transition ${
                            editColor === c ? "ring-2 ring-primary ring-offset-2 ring-offset-surface" : ""
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => handleSaveEdit(l.id)}
                      aria-label="Speichern"
                      className="text-emerald-500 transition hover:opacity-80"
                    >
                      <Check size={17} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      aria-label="Abbrechen"
                      className="text-text-muted transition hover:text-text"
                    >
                      <X size={17} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={labelStyle(l.farbe)}>
                      {l.name}
                    </span>
                    <span className="text-sm text-text-muted">{usage > 0 ? `${usage}× verwendet` : "Unbenutzt"}</span>
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        onClick={() => startEdit(l)}
                        aria-label={`Label ${l.name} bearbeiten`}
                        className="rounded-lg p-1.5 text-text-muted transition hover:bg-bg hover:text-text"
                      >
                        <Pencil size={15} />
                      </button>
                      {confirmDeleteId === l.id ? (
                        <>
                          <span className="text-xs text-text-muted">Wirklich löschen?</span>
                          <button
                            onClick={() => deleteLabel.mutate(l.id)}
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
                          onClick={() => setConfirmDeleteId(l.id)}
                          aria-label={`Label ${l.name} löschen`}
                          className="rounded-lg p-1.5 text-text-muted transition hover:bg-bg hover:text-red-500"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
