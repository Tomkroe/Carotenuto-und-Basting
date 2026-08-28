"use client";

import { useRef, useState, useEffect, FormEvent } from "react";
import { CheckCircle2, Loader2, Send, Sparkles, X } from "lucide-react";
import type { AssistantChatMessage } from "@maklerprogram/types";
import { useAssistantChat } from "@/lib/hooks";
import { ApiError } from "@/lib/api";

type DisplayMessage = AssistantChatMessage & { actions?: string[] };

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const chat = useAssistantChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, chat.isPending]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || chat.isPending) return;
    setError(null);
    setInput("");

    const nextMessages: DisplayMessage[] = [...messages, { role: "user", text }];
    setMessages(nextMessages);

    try {
      const result = await chat.mutateAsync(nextMessages.map(({ role, text }) => ({ role, text })));
      setMessages([...nextMessages, { role: "model", text: result.reply, actions: result.actions.map((a) => a.label) }]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Der Assistent ist gerade nicht erreichbar.");
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[32rem] w-96 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="flex items-center gap-1.5 font-semibold">
              <Sparkles size={16} className="text-primary" />
              KI-Assistent
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-text-muted transition hover:text-text"
              aria-label="Assistent schließen"
            >
              <X size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <p className="text-sm text-text-muted">
                Frag mich z.B. „Leg einen Vorgang für die defekte Heizung in Wohnung 1 an."
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    m.role === "user" ? "bg-primary text-primary-fg" : "bg-bg text-text"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {m.actions && m.actions.length > 0 && (
                    <div className="mt-2 space-y-1 border-t border-border/50 pt-2">
                      {m.actions.map((a, ai) => (
                        <div key={ai} className="flex items-center gap-1.5 text-xs text-emerald-500">
                          <CheckCircle2 size={12} />
                          {a}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {chat.isPending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-xl bg-bg px-3 py-2 text-sm text-text-muted">
                  <Loader2 size={14} className="animate-spin" />
                  Denkt nach…
                </div>
              </div>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <form onSubmit={handleSend} className="flex gap-2 border-t border-border p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nachricht…"
              className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={chat.isPending || !input.trim()}
              className="flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-primary-fg transition hover:opacity-90 disabled:opacity-50"
              aria-label="Senden"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-fg shadow-lg transition hover:opacity-90"
        aria-label="KI-Assistent öffnen"
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
      </button>
    </>
  );
}
