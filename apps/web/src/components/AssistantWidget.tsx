"use client";

import { useRef, useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Check, CheckCircle2, Copy, Loader2, Mail, Paperclip, Send, Sparkles, X } from "lucide-react";
import type { AssistantChatMessage, AssistantEmailDraft } from "@maklerprogram/types";
import { useAssistantChat } from "@/lib/hooks";
import { ApiError } from "@/lib/api";

type DisplayMessage = AssistantChatMessage & {
  actions?: string[];
  attachmentName?: string;
  emailDraft?: AssistantEmailDraft;
};

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function EmailDraftCard({ draft }: { draft: AssistantEmailDraft }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(`An: ${draft.an}\nBetreff: ${draft.betreff}\n\n${draft.text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mt-2 space-y-1.5 rounded-lg border border-border bg-surface p-2.5 text-xs">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium text-text">
          <Mail size={12} />
          E-Mail-Entwurf
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-text-muted transition hover:text-primary"
          aria-label="Entwurf kopieren"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Kopiert" : "Kopieren"}
        </button>
      </div>
      <p className="text-text-muted">
        <span className="font-medium text-text">An:</span> {draft.an}
      </p>
      <p className="text-text-muted">
        <span className="font-medium text-text">Betreff:</span> {draft.betreff}
      </p>
      <p className="whitespace-pre-wrap text-text-muted">{draft.text}</p>
    </div>
  );
}

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const chat = useAssistantChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, chat.isPending]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setAttachedFile(e.target.files?.[0] ?? null);
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if ((!text && !attachedFile) || chat.isPending) return;
    setError(null);
    setInput("");
    const file = attachedFile;
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    const nextMessages: DisplayMessage[] = [
      ...messages,
      { role: "user", text: text || `Datei angehängt: ${file?.name}`, attachmentName: file?.name },
    ];
    setMessages(nextMessages);

    try {
      const attachment = file
        ? { filename: file.name, mimeType: file.type || "application/octet-stream", dataBase64: await readFileAsBase64(file) }
        : undefined;
      const result = await chat.mutateAsync({
        messages: nextMessages.map(({ role, text }) => ({ role, text })),
        attachment,
      });
      setMessages([
        ...nextMessages,
        {
          role: "model",
          text: result.reply,
          actions: result.actions.map((a) => a.label),
          emailDraft: result.emailDraft ?? undefined,
        },
      ]);
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
                Frag mich z.B. „Leg einen Vorgang für die defekte Heizung in Wohnung 1 an.&rdquo; oder häng ein
                Dokument an eine Nachricht.
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
                  {m.attachmentName && (
                    <p className="mt-1 flex items-center gap-1 text-xs opacity-80">
                      <Paperclip size={11} />
                      {m.attachmentName}
                    </p>
                  )}
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
                  {m.emailDraft && <EmailDraftCard draft={m.emailDraft} />}
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

          <form onSubmit={handleSend} className="border-t border-border p-3">
            {attachedFile && (
              <div className="mb-2 flex items-center justify-between rounded-lg border border-border bg-bg px-2.5 py-1.5 text-xs">
                <span className="flex items-center gap-1.5 text-text-muted">
                  <Paperclip size={12} />
                  {attachedFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAttachedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-text-muted transition hover:text-red-500"
                  aria-label="Anhang entfernen"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center rounded-lg border border-border px-3 py-2 text-text-muted transition hover:border-primary hover:text-primary"
                aria-label="Datei anhängen"
              >
                <Paperclip size={16} />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nachricht…"
                className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={chat.isPending || (!input.trim() && !attachedFile)}
                className="flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-primary-fg transition hover:opacity-90 disabled:opacity-50"
                aria-label="Senden"
              >
                <Send size={16} />
              </button>
            </div>
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
