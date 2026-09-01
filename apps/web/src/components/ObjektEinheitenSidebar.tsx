"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus, UserRound } from "lucide-react";
import { Einheit, Mietvertrag, MietvertragStatus, Objekt } from "@maklerprogram/types";

function kontaktName(k: { vorname: string | null; nachname: string | null; firma: string | null }) {
  return [k.vorname, k.nachname].filter(Boolean).join(" ") || k.firma || "Unbenannt";
}

function statusBadge(einheitId: string, mietvertraege: Mietvertrag[] | undefined) {
  const aktiv = mietvertraege?.find((m) => m.einheit.id === einheitId && m.status === MietvertragStatus.AKTIV);
  if (aktiv) return { label: "Vermietet", mieter: aktiv.mieter, className: "bg-primary/10 text-primary" };
  const geplant = mietvertraege?.find((m) => m.einheit.id === einheitId && m.status === MietvertragStatus.GEPLANT);
  if (geplant) return { label: "Geplant", mieter: geplant.mieter, className: "bg-amber-500/10 text-amber-600" };
  return { label: "Leerstand", mieter: null, className: "bg-red-500/10 text-red-500" };
}

interface ObjektEinheitenSidebarProps {
  objektId: string;
  objekt: Objekt;
  einheiten: Einheit[] | undefined;
  mietvertraege: Mietvertrag[] | undefined;
  onNeueEinheitClick: () => void;
  neueEinheitAktiv: boolean;
  children?: React.ReactNode;
}

export function ObjektEinheitenSidebar({
  objektId,
  objekt,
  einheiten,
  mietvertraege,
  onNeueEinheitClick,
  neueEinheitAktiv,
  children,
}: ObjektEinheitenSidebarProps) {
  const params = useParams<{ einheitId?: string }>();
  const activeEinheitId = params?.einheitId;

  return (
    <aside className="w-full shrink-0 space-y-4 lg:w-72">
      <Link
        href={`/objekte/${objektId}`}
        className="block rounded-lg border border-border bg-surface p-4 transition hover:border-primary"
      >
        <p className="font-semibold">{objekt.name}</p>
        <p className="mt-0.5 text-sm text-text-muted">
          {objekt.strasse} {objekt.hausnummer}, {objekt.plz} {objekt.ort}
        </p>
      </Link>

      <button
        onClick={onNeueEinheitClick}
        className="flex w-full items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-text-muted transition hover:border-primary hover:text-primary"
      >
        <Plus size={15} />
        {neueEinheitAktiv ? "Abbrechen" : "Neue Einheit hinzufügen"}
      </button>

      {children}

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        {einheiten && einheiten.length === 0 && (
          <p className="p-4 text-sm text-text-muted">Noch keine Einheiten angelegt.</p>
        )}
        {einheiten?.map((e) => {
          const badge = statusBadge(e.id, mietvertraege);
          const active = e.id === activeEinheitId;
          return (
            <Link
              key={e.id}
              href={`/objekte/${objektId}/einheiten/${e.id}`}
              className={`block border-b border-border px-4 py-3 last:border-b-0 transition ${
                active ? "bg-primary/10" : "hover:bg-bg"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{e.name}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-text-muted">
                {e.kategorie}
                {e.flaeche != null && ` · ${e.flaeche.toLocaleString("de-DE")} m²`}
              </p>
              {badge.mieter && (
                <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
                  <UserRound size={11} /> {kontaktName(badge.mieter)}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
