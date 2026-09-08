"use client";

import { useState, FormEvent } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  useDokumentKategorien,
  useCreateDokumentKategorie,
  useUpdateDokumentKategorie,
  useDeleteDokumentKategorie,
} from "@/lib/hooks";
import { ApiError } from "@/lib/api";

export function DokumentKategorienManager() {
  const { data: kategorien, isLoading } = useDokumentKategorien();
  const createKategorie = useCreateDokumentKategorie();
  const updateKategorie = useUpdateDokumentKategorie();
  const deleteKategorie = useDeleteDokumentKategorie();

  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setError(null);
    try {
      await createKategorie.mutateAsync({ name: newName.trim() });
      setNewName("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kategorie konnte nicht angelegt werden.");
    }
  }

  function startEdit(k: { id: string; name: string }) {
    setEditingId(k.id);
    setEditName(k.name);
    setConfirmDeleteId(null);
  }

  async function handleSaveEdit(id: string) {
    if (!editName.trim()) return;
    await updateKategorie.mutateAsync({ id, data: { name: editName.trim() } });
    setEditingId(null);
  }

  return (
    <div className="mb-6 space-y-3 rounded-lg border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Kategorien verwalten</h2>

      <form onSubmit={handleCreate} className="flex items-center gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Neue Kategorie…"
          className="flex-1 rounded-lg border border-border bg-bg px-3 py-1.5 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={createKategorie.isPending}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
        >
          <Plus size={15} /> Anlegen
        </button>
      </form>
      {error && <p className="text-sm text-red-500">{error}</p>}

      {isLoading && <p className="text-sm text-text-muted">Lädt…</p>}
      {kategorien && kategorien.length === 0 && <p className="text-sm text-text-muted">Noch keine Kategorien.</p>}

      {kategorien && kategorien.length > 0 && (
        <div className="divide-y divide-border rounded-lg border border-border bg-bg">
          {kategorien.map((k) => (
            <div key={k.id} className="flex items-center gap-3 px-3 py-2">
              {editingId === k.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                    className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => handleSaveEdit(k.id)}
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
                  <span className="flex-1 text-sm">{k.name}</span>
                  <span className="text-xs text-text-muted">
                    {(k.dokumentCount ?? 0) > 0 ? `${k.dokumentCount}× verwendet` : "Unbenutzt"}
                  </span>
                  <button
                    onClick={() => startEdit(k)}
                    aria-label={`Kategorie ${k.name} bearbeiten`}
                    className="rounded-lg p-1.5 text-text-muted transition hover:bg-surface hover:text-text"
                  >
                    <Pencil size={15} />
                  </button>
                  {confirmDeleteId === k.id ? (
                    <>
                      <span className="text-xs text-text-muted">Wirklich löschen?</span>
                      <button
                        onClick={() => deleteKategorie.mutate(k.id)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-500/10"
                      >
                        Ja
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-lg px-2 py-1 text-xs text-text-muted hover:bg-surface"
                      >
                        Abbrechen
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(k.id)}
                      aria-label={`Kategorie ${k.name} löschen`}
                      className="rounded-lg p-1.5 text-text-muted transition hover:bg-surface hover:text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
