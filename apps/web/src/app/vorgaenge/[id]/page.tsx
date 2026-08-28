"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CircleDot, Clock, CheckCircle2, Trash2, Send, Square, CheckSquare, Tag, Plus, X } from "lucide-react";
import { VorgangStatus } from "@maklerprogram/types";
import {
  useCurrentUser,
  useVorgang,
  useUpdateVorgang,
  useDeleteVorgang,
  useTodos,
  useCreateTodo,
  useToggleTodo,
  useDeleteTodo,
  useKommentare,
  useCreateKommentar,
  useLabels,
  useCreateLabel,
  useAttachLabel,
  useDetachLabel,
} from "@/lib/hooks";
import { AppHeader } from "@/components/AppHeader";
import { DokumenteSection } from "@/components/DokumenteSection";

const LABEL_COLORS = [
  "#3b82f6",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#f43f5e",
  "#f97316",
  "#06b6d4",
  "#64748b",
];

const STATUS_META: Record<VorgangStatus, { label: string; icon: typeof CircleDot; className: string }> = {
  [VorgangStatus.OFFEN]: { label: "Offen", icon: CircleDot, className: "bg-blue-500/10 text-blue-500" },
  [VorgangStatus.IN_BEARBEITUNG]: {
    label: "In Bearbeitung",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-500",
  },
  [VorgangStatus.ABGESCHLOSSEN]: {
    label: "Abgeschlossen",
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-500",
  },
};

function kontaktName(k: { vorname: string | null; nachname: string | null; firma: string | null }) {
  return [k.vorname, k.nachname].filter(Boolean).join(" ") || k.firma || "Unbenannt";
}

export default function VorgangDetailPage() {
  const params = useParams<{ id: string }>();
  const vorgangId = params.id;
  const router = useRouter();

  const { isError: authError } = useCurrentUser();
  const { data: vorgang, isLoading, isError: vorgangError } = useVorgang(vorgangId);
  const updateVorgang = useUpdateVorgang(vorgangId);
  const deleteVorgang = useDeleteVorgang();

  const { data: todos } = useTodos(vorgangId);
  const createTodo = useCreateTodo(vorgangId);
  const toggleTodo = useToggleTodo(vorgangId);
  const deleteTodo = useDeleteTodo(vorgangId);

  const { data: kommentare } = useKommentare(vorgangId);
  const createKommentar = useCreateKommentar(vorgangId);

  const { data: alleLabels } = useLabels();
  const createLabel = useCreateLabel();
  const attachLabel = useAttachLabel(vorgangId);
  const detachLabel = useDetachLabel(vorgangId);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newTodo, setNewTodo] = useState("");
  const [newKommentar, setNewKommentar] = useState("");
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0]);

  useEffect(() => {
    if (authError) router.replace("/login");
  }, [authError, router]);

  useEffect(() => {
    if (vorgangError) router.replace("/vorgaenge");
  }, [vorgangError, router]);

  async function handleDelete() {
    await deleteVorgang.mutateAsync(vorgangId);
    router.replace("/vorgaenge");
  }

  function handleAddTodo(e: FormEvent) {
    e.preventDefault();
    if (!newTodo.trim()) return;
    createTodo.mutate({ titel: newTodo });
    setNewTodo("");
  }

  function handleAddKommentar(e: FormEvent) {
    e.preventDefault();
    if (!newKommentar.trim()) return;
    createKommentar.mutate({ text: newKommentar });
    setNewKommentar("");
  }

  async function handleCreateAndAttachLabel(e: FormEvent) {
    e.preventDefault();
    if (!newLabelName.trim()) return;
    const label = await createLabel.mutateAsync({ name: newLabelName, farbe: newLabelColor });
    await attachLabel.mutateAsync(label.id);
    setNewLabelName("");
    setNewLabelColor(LABEL_COLORS[0]);
  }

  if (isLoading || !vorgang) {
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
          <Link href="/vorgaenge" className="hover:text-primary">
            Vorgänge
          </Link>
          <span>/</span>
          <span className="text-text">#{vorgang.nummer}</span>
        </nav>

        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{vorgang.titel}</h1>
            {vorgang.beschreibung && <p className="mt-2 max-w-xl text-text-muted">{vorgang.beschreibung}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-text-muted">
              {vorgang.objekt && <span>{vorgang.objekt.name}</span>}
              {vorgang.kontakt && <span>· {kontaktName(vorgang.kontakt)}</span>}
              {vorgang.faelligkeit && (
                <span>· fällig {new Date(vorgang.faelligkeit).toLocaleDateString("de-DE")}</span>
              )}
            </div>
          </div>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-text-muted transition hover:text-red-500"
              aria-label="Vorgang löschen"
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

        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-1.5">
            {vorgang.labels.map((l) => (
              <span
                key={l.id}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: l.farbe }}
              >
                {l.name}
                <button
                  onClick={() => detachLabel.mutate(l.id)}
                  aria-label={`Label ${l.name} entfernen`}
                  className="opacity-80 hover:opacity-100"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            <button
              onClick={() => setShowLabelPicker((v) => !v)}
              className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-text-muted transition hover:border-primary hover:text-primary"
            >
              <Tag size={12} />
              Label
            </button>
          </div>

          {showLabelPicker && (
            <div className="mt-2 space-y-3 rounded-lg border border-border bg-surface p-3">
              {alleLabels && alleLabels.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {alleLabels
                    .filter((l) => !vorgang.labels.some((vl) => vl.id === l.id))
                    .map((l) => (
                      <button
                        key={l.id}
                        onClick={() => attachLabel.mutate(l.id)}
                        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-white transition hover:opacity-80"
                        style={{ backgroundColor: l.farbe }}
                      >
                        <Plus size={11} />
                        {l.name}
                      </button>
                    ))}
                </div>
              )}
              <form onSubmit={handleCreateAndAttachLabel} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder="Neues Label…"
                  className="flex-1 rounded-lg border border-border bg-bg px-3 py-1.5 text-sm outline-none focus:border-primary"
                />
                <div className="flex items-center gap-1">
                  {LABEL_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewLabelColor(c)}
                      aria-label={`Farbe ${c}`}
                      className={`h-5 w-5 rounded-full transition ${
                        newLabelColor === c ? "ring-2 ring-primary ring-offset-2 ring-offset-surface" : ""
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-fg transition hover:opacity-90"
                >
                  Anlegen
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="mb-8 flex gap-2">
          {Object.values(VorgangStatus).map((s) => {
            const meta = STATUS_META[s];
            const Icon = meta.icon;
            const active = vorgang.status === s;
            return (
              <button
                key={s}
                onClick={() => updateVorgang.mutate({ status: s })}
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

        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">ToDos</h2>
          <form onSubmit={handleAddTodo} className="mb-3 flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Neues ToDo…"
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition hover:opacity-90"
            >
              Hinzufügen
            </button>
          </form>

          {todos && todos.length === 0 && <p className="text-sm text-text-muted">Keine ToDos.</p>}

          {todos && todos.length > 0 && (
            <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
              {todos.map((t) => (
                <li key={t.id} className="flex items-center justify-between px-4 py-2.5">
                  <button
                    onClick={() => toggleTodo.mutate({ id: t.id, erledigt: !t.erledigt })}
                    className="flex items-center gap-2 text-left"
                  >
                    {t.erledigt ? (
                      <CheckSquare size={17} className="text-primary" />
                    ) : (
                      <Square size={17} className="text-text-muted" />
                    )}
                    <span className={t.erledigt ? "text-text-muted line-through" : ""}>{t.titel}</span>
                  </button>
                  <button
                    onClick={() => deleteTodo.mutate(t.id)}
                    className="text-text-muted transition hover:text-red-500"
                    aria-label="ToDo löschen"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold">Kommentare</h2>
          <form onSubmit={handleAddKommentar} className="mb-3 flex gap-2">
            <input
              type="text"
              value={newKommentar}
              onChange={(e) => setNewKommentar(e.target.value)}
              placeholder="Kommentar schreiben…"
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition hover:opacity-90"
            >
              <Send size={15} />
            </button>
          </form>

          {kommentare && kommentare.length === 0 && <p className="text-sm text-text-muted">Noch keine Kommentare.</p>}

          {kommentare && kommentare.length > 0 && (
            <ul className="space-y-2">
              {kommentare.map((k) => (
                <li key={k.id} className="rounded-lg border border-border bg-surface px-4 py-2.5">
                  <p className="text-sm">{k.text}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    {k.autor.name} · {new Date(k.createdAt).toLocaleString("de-DE")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8">
          <DokumenteSection parent={{ path: "vorgaenge", id: vorgangId }} />
        </div>
      </section>
    </main>
  );
}
