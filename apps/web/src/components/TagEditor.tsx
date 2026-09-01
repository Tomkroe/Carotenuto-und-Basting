"use client";

import { FormEvent, useState } from "react";
import { Plus, X } from "lucide-react";

interface TagEditorProps {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  pending?: boolean;
  placeholder?: string;
  emptyLabel?: string;
}

export function TagEditor({ tags, onAdd, onRemove, pending, placeholder, emptyLabel }: TagEditorProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const tag = value.trim();
    if (!tag || tags.includes(tag)) return;
    onAdd(tag);
    setValue("");
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder ?? "Tag hinzufügen…"}
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
        >
          <Plus size={15} />
          Hinzufügen
        </button>
      </form>

      {tags.length === 0 ? (
        <p className="text-sm text-text-muted">{emptyLabel ?? "Noch nichts erfasst."}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm"
            >
              {tag}
              <button
                onClick={() => onRemove(tag)}
                aria-label={`${tag} entfernen`}
                className="text-text-muted transition hover:text-red-500"
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
