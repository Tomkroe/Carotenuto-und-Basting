"use client";

import { useState, FormEvent } from "react";
import { Send, MessageCircle } from "lucide-react";
import { useKommentare, useCreateKommentar, KommentarParent } from "@/lib/hooks";

export function KommentareSection({ parent }: { parent: KommentarParent }) {
  const { data: kommentare } = useKommentare(parent);
  const createKommentar = useCreateKommentar(parent);
  const [newKommentar, setNewKommentar] = useState("");

  function handleAddKommentar(e: FormEvent) {
    e.preventDefault();
    if (!newKommentar.trim()) return;
    createKommentar.mutate({ text: newKommentar });
    setNewKommentar("");
  }

  return (
    <div>
      <h2 className="mb-3 flex items-center gap-1.5 text-lg font-semibold">
        <MessageCircle size={18} />
        Kommentare
      </h2>
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
  );
}
