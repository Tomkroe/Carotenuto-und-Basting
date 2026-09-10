"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ReceiptText } from "lucide-react";
import { ForderungStatusWert } from "@maklerprogram/types";
import { useAlleDokumente, useForderungen } from "@/lib/hooks";

interface Empfehlung {
  key: string;
  icon: typeof FileText;
  titel: string;
  text: string;
  href: string;
}

export function HandlungsempfehlungenCard() {
  const router = useRouter();
  const { data: dokumente } = useAlleDokumente();
  const { data: ueberfaelligeForderungen } = useForderungen({ status: ForderungStatusWert.UEBERFAELLIG });
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const ohneKategorie = (dokumente ?? []).filter((d) => !d.kategorie).length;
  const ueberfaellig = ueberfaelligeForderungen?.length ?? 0;

  const empfehlungen: Empfehlung[] = [];
  if (ohneKategorie > 0) {
    empfehlungen.push({
      key: "dokumente-ohne-kategorie",
      icon: FileText,
      titel: "Dokumente",
      text:
        ohneKategorie === 1
          ? "Du hast ein Dokument ohne Kategorie."
          : `Du hast ${ohneKategorie} Dokumente ohne Kategorie.`,
      href: "/dokumente",
    });
  }
  if (ueberfaellig > 0) {
    empfehlungen.push({
      key: "mieten-ueberfaellig",
      icon: ReceiptText,
      titel: "Mieten",
      text:
        ueberfaellig === 1
          ? "Du hast eine überfällige Miete."
          : `Du hast ${ueberfaellig} überfällige Mieten.`,
      href: "/finanzen",
    });
  }

  const sichtbar = empfehlungen.filter((e) => !dismissed.has(e.key));
  if (sichtbar.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      <h2 className="text-sm font-semibold text-text-muted">Deine Handlungsempfehlungen</h2>
      {sichtbar.map((e) => {
        const Icon = e.icon;
        return (
          <div key={e.key} className="rounded-xl border border-border bg-surface p-4">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-primary">
              <Icon size={16} />
              {e.titel}
            </div>
            <p className="mb-3 text-sm text-text">{e.text}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(e.href)}
                className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-fg transition hover:opacity-90"
              >
                Ansehen
              </button>
              <button
                onClick={() => setDismissed((prev) => new Set(prev).add(e.key))}
                className="rounded-full px-3 py-1.5 text-xs text-text-muted transition hover:bg-bg"
              >
                Später
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
