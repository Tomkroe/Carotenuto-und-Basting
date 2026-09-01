"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CircleDot,
  Clock,
  CheckCircle2,
  History,
  Pencil,
  Trash2,
  Square,
  CheckSquare,
  Tag,
  Plus,
  X,
  Undo2,
  Home,
} from "lucide-react";
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
  useLabels,
  useCreateLabel,
  useAttachLabel,
  useDetachLabel,
  useUsers,
  useVorgangVerlauf,
  useEinheitenFlat,
} from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { DokumenteSection } from "@/components/DokumenteSection";
import { KommentareSection } from "@/components/KommentareSection";
import { TodoIcon } from "@/components/TodoIcon";

const LABEL_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#f43f5e", "#f97316", "#06b6d4", "#64748b"];

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

export function VorgangDetailContent({ vorgangId }: { vorgangId: string }) {
  const router = useRouter();

  const { isError: authError } = useCurrentUser();
  const { data: vorgang, isLoading, isError: vorgangError } = useVorgang(vorgangId);
  const updateVorgang = useUpdateVorgang(vorgangId);
  const deleteVorgang = useDeleteVorgang();

  const { data: todos } = useTodos(vorgangId);
  const createTodo = useCreateTodo(vorgangId);
  const toggleTodo = useToggleTodo(vorgangId);
  const deleteTodo = useDeleteTodo(vorgangId);

  const { data: alleLabels } = useLabels();
  const createLabel = useCreateLabel();
  const attachLabel = useAttachLabel(vorgangId);
  const detachLabel = useDetachLabel(vorgangId);
  const { data: users } = useUsers();
  const { data: verlauf } = useVorgangVerlauf(vorgangId);
  const { data: einheiten } = useEinheitenFlat();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newTodo, setNewTodo] = useState("");
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0]);
  const [previousStatus, setPreviousStatus] = useState<VorgangStatus | null>(null);

  const [editing, setEditing] = useState(false);
  const [editTitel, setEditTitel] = useState("");
  const [editBeschreibung, setEditBeschreibung] = useState("");
  const [editFaelligkeit, setEditFaelligkeit] = useState("");
  const [editVerantwortlicherId, setEditVerantwortlicherId] = useState("");
  const [editEinheitId, setEditEinheitId] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const einheitenByObjekt = (() => {
    const groups = new Map<string, { objektName: string; einheiten: typeof einheiten }>();
    for (const e of einheiten ?? []) {
      if (!groups.has(e.objekt.id)) groups.set(e.objekt.id, { objektName: e.objekt.name, einheiten: [] });
      groups.get(e.objekt.id)!.einheiten!.push(e);
    }
    return Array.from(groups.values());
  })();

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

  function startEdit() {
    if (!vorgang) return;
    setEditTitel(vorgang.titel);
    setEditBeschreibung(vorgang.beschreibung ?? "");
    setEditFaelligkeit(vorgang.faelligkeit ? vorgang.faelligkeit.slice(0, 10) : "");
    setEditVerantwortlicherId(vorgang.verantwortlicher?.id ?? "");
    setEditEinheitId(vorgang.einheit?.id ?? "");
    setEditError(null);
    setEditing(true);
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    setEditError(null);
    try {
      await updateVorgang.mutateAsync({
        titel: editTitel,
        beschreibung: editBeschreibung || undefined,
        faelligkeit: editFaelligkeit || undefined,
        verantwortlicherId: editVerantwortlicherId || undefined,
        einheitId: editEinheitId || undefined,
      });
      setEditing(false);
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : "Vorgang konnte nicht gespeichert werden.");
    }
  }

  function handleStatusChange(status: VorgangStatus) {
    if (!vorgang || status === vorgang.status) return;
    setPreviousStatus(vorgang.status);
    updateVorgang.mutate({ status });
  }

  function handleUndoStatus() {
    if (!previousStatus) return;
    updateVorgang.mutate({ status: previousStatus });
    setPreviousStatus(null);
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
    return <div className="flex min-h-[50vh] items-center justify-center text-text-muted">Lädt…</div>;
  }

  return (
    <>
      <nav className="mb-4 flex items-center gap-2 text-sm text-text-muted">
        <Link href="/vorgaenge" className="hover:text-primary">
          Vorgänge
        </Link>
        <span>/</span>
        <span className="text-text">#{vorgang.nummer}</span>
      </nav>

      <div className="mb-6 flex items-start justify-between">
        {!editing && (
          <div>
            <h1 className="text-2xl font-semibold">{vorgang.titel}</h1>
            {vorgang.beschreibung && <p className="mt-2 max-w-xl text-text-muted">{vorgang.beschreibung}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-text-muted">
              {vorgang.objekt && <span>{vorgang.objekt.name}</span>}
              {vorgang.einheit && (
                <Link
                  href={`/objekte/${vorgang.einheit.objekt.id}/einheiten/${vorgang.einheit.id}`}
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <Home size={13} />· {vorgang.einheit.objekt.name} · {vorgang.einheit.name}
                </Link>
              )}
              {vorgang.kontakt && <span>· {kontaktName(vorgang.kontakt)}</span>}
              {vorgang.faelligkeit && <span>· fällig {new Date(vorgang.faelligkeit).toLocaleDateString("de-DE")}</span>}
              {vorgang.verantwortlicher && <span>· {vorgang.verantwortlicher.name}</span>}
            </div>
          </div>
        )}

        {!editing && (
          <div className="flex items-center gap-3">
            {!confirmDelete && (
              <button
                onClick={startEdit}
                className="text-text-muted transition hover:text-primary"
                aria-label="Vorgang bearbeiten"
              >
                <Pencil size={18} />
              </button>
            )}
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
        )}
      </div>

      {editing && (
        <form onSubmit={handleSaveEdit} className="mb-6 space-y-4 rounded-lg border border-border bg-surface p-4">
          <div>
            <label className="mb-1 block text-sm text-text-muted" htmlFor="editTitel">
              Titel
            </label>
            <input
              id="editTitel"
              type="text"
              required
              value={editTitel}
              onChange={(e) => setEditTitel(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted" htmlFor="editBeschreibung">
              Beschreibung
            </label>
            <textarea
              id="editBeschreibung"
              rows={3}
              value={editBeschreibung}
              onChange={(e) => setEditBeschreibung(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted" htmlFor="editFaelligkeit">
              Fälligkeit
            </label>
            <input
              id="editFaelligkeit"
              type="date"
              value={editFaelligkeit}
              onChange={(e) => setEditFaelligkeit(e.target.value)}
              className="rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted" htmlFor="editVerantwortlicherId">
              Verantwortlich
            </label>
            <select
              id="editVerantwortlicherId"
              value={editVerantwortlicherId}
              onChange={(e) => setEditVerantwortlicherId(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
            >
              <option value="">–</option>
              {users?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted" htmlFor="editEinheitId">
              Wohnung/Einheit
            </label>
            <select
              id="editEinheitId"
              value={editEinheitId}
              onChange={(e) => setEditEinheitId(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
            >
              <option value="">–</option>
              {einheitenByObjekt.map((group) => (
                <optgroup key={group.objektName} label={group.objektName}>
                  {group.einheiten!.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {editError && <p className="text-sm text-red-500">{editError}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={updateVorgang.isPending}
              className="flex-1 rounded-lg bg-primary py-2 font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
            >
              {updateVorgang.isPending ? "Wird gespeichert…" : "Speichern"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-border px-4 py-2 text-text-muted"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}

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

      <div className="mb-8 flex items-center gap-2">
        {Object.values(VorgangStatus).map((s) => {
          const meta = STATUS_META[s];
          const Icon = meta.icon;
          const active = vorgang.status === s;
          return (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition ${
                active ? meta.className : "border border-border text-text-muted hover:border-primary"
              }`}
            >
              <Icon size={14} />
              {meta.label}
            </button>
          );
        })}
        {previousStatus && (
          <button
            onClick={handleUndoStatus}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-text-muted transition hover:border-primary hover:text-primary"
          >
            <Undo2 size={14} />
            Rückgängig
          </button>
        )}
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
                <button onClick={() => toggleTodo.mutate({ id: t.id, erledigt: !t.erledigt })} className="flex items-center gap-2 text-left">
                  {t.erledigt ? <CheckSquare size={17} className="text-primary" /> : <Square size={17} className="text-text-muted" />}
                  <TodoIcon icon={t.icon} size={15} className="text-text-muted" />
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

      <div className="mb-8">
        <h2 className="mb-3 flex items-center gap-1.5 text-lg font-semibold">
          <History size={18} />
          Verlauf
        </h2>

        {verlauf && verlauf.length === 0 && <p className="text-sm text-text-muted">Noch keine Einträge.</p>}

        {verlauf && verlauf.length > 0 && (
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
            {verlauf.map((v) => (
              <li key={v.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span>{v.text}</span>
                <span className="text-text-muted">
                  {v.autor.name} · {new Date(v.createdAt).toLocaleString("de-DE")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <KommentareSection parent={{ path: "vorgaenge", id: vorgangId }} />

      <div className="mt-8">
        <DokumenteSection parent={{ path: "vorgaenge", id: vorgangId }} />
      </div>
    </>
  );
}
