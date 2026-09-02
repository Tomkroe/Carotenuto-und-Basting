"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Sparkles, Trash2, X } from "lucide-react";
import { useCurrentUser, useWorkflows, useCreateWorkflow, useUpdateWorkflow, useDeleteWorkflow } from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { DEFAULT_WORKFLOWS } from "@/lib/defaultWorkflows";

export default function WorkflowsPage() {
  const router = useRouter();
  const { isError: authError } = useCurrentUser();
  const { data: workflows, isLoading } = useWorkflows();
  const createWorkflow = useCreateWorkflow();
  const updateWorkflow = useUpdateWorkflow();
  const deleteWorkflow = useDeleteWorkflow();

  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editPrompt, setEditPrompt] = useState("");

  useEffect(() => {
    if (authError) router.replace("/login");
  }, [authError, router]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createWorkflow.mutateAsync({ label, prompt });
      setLabel("");
      setPrompt("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Workflow konnte nicht angelegt werden.");
    }
  }

  function startEdit(id: string, currentLabel: string, currentPrompt: string) {
    setEditingId(id);
    setEditLabel(currentLabel);
    setEditPrompt(currentPrompt);
  }

  async function handleSaveEdit(id: string) {
    await updateWorkflow.mutateAsync({ id, data: { label: editLabel, prompt: editPrompt } });
    setEditingId(null);
  }

  const uebernommeneLabels = new Set((workflows ?? []).map((w) => w.label));
  const vorschlaege = DEFAULT_WORKFLOWS.filter((w) => !uebernommeneLabels.has(w.label));

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <Sparkles size={20} className="text-primary" />
          Workflows
        </h1>
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
              <Plus size={16} /> Neuer Workflow
            </>
          )}
        </button>
      </div>
      <p className="mb-6 text-sm text-text-muted">
        Kurze Prompt-Vorlagen, die im Jarvis-Chat unter „Workflows" als Ein-Klick-Vorschläge erscheinen.
      </p>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-8 space-y-4 rounded-lg border border-border bg-surface p-4">
          <div>
            <label className="mb-1 block text-sm text-text-muted" htmlFor="label">
              Name
            </label>
            <input
              id="label"
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="z.B. Zählerstand erfassen"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted" htmlFor="prompt">
              Prompt
            </label>
            <textarea
              id="prompt"
              rows={3}
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="z.B. Trag folgenden Zählerstand ein: "
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={createWorkflow.isPending}
            className="w-full rounded-lg bg-primary py-2 font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
          >
            {createWorkflow.isPending ? "Wird angelegt…" : "Workflow anlegen"}
          </button>
        </form>
      )}

      {isLoading && <p className="text-text-muted">Lädt…</p>}

      {workflows && workflows.length === 0 && !showForm && (
        <p className="mb-6 text-sm text-text-muted">Noch keine eigenen Workflows angelegt.</p>
      )}

      {workflows && workflows.length > 0 && (
        <ul className="mb-8 divide-y divide-border rounded-lg border border-border bg-surface">
          {workflows.map((w) => (
            <li key={w.id} className="px-4 py-3">
              {editingId === w.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm outline-none focus:border-primary"
                  />
                  <textarea
                    rows={2}
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm outline-none focus:border-primary"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(w.id)}
                      disabled={updateWorkflow.isPending}
                      className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
                    >
                      Speichern
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-full border border-border px-3 py-1 text-xs text-text-muted"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{w.label}</p>
                    <p className="truncate text-sm text-text-muted">{w.prompt}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      onClick={() => startEdit(w.id, w.label, w.prompt)}
                      className="text-text-muted transition hover:text-primary"
                      aria-label="Workflow bearbeiten"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => deleteWorkflow.mutate(w.id)}
                      className="text-text-muted transition hover:text-red-500"
                      aria-label="Workflow löschen"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {vorschlaege.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Vorschläge</h2>
          <ul className="divide-y divide-border rounded-lg border border-dashed border-border">
            {vorschlaege.map((w) => (
              <li key={w.label} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium">{w.label}</p>
                  <p className="truncate text-sm text-text-muted">{w.prompt}</p>
                </div>
                <button
                  onClick={() => createWorkflow.mutate({ label: w.label, prompt: w.prompt })}
                  disabled={createWorkflow.isPending}
                  className="flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-text-muted transition hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  <Plus size={13} />
                  Übernehmen
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
