"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { KeyRound, Plus, UserRound } from "lucide-react";
import { Eigentuemerschaft, Einheit, Mietvertrag, MietvertragStatus, Objekt, ObjektTyp } from "@maklerprogram/types";

function kontaktName(k: { vorname: string | null; nachname: string | null; firma: string | null }) {
  return [k.vorname, k.nachname].filter(Boolean).join(" ") || k.firma || "Unbenannt";
}

function statusBadge(einheitId: string, mietvertraege: Mietvertrag[] | undefined) {
  const aktiv = mietvertraege?.find((m) => m.einheit.id === einheitId && m.status === MietvertragStatus.AKTIV);
  if (aktiv) {
    return { label: "Vermietet", mieter: aktiv.mieter, kaltmiete: aktiv.kaltmiete, className: "bg-primary/10 text-primary" };
  }
  const geplant = mietvertraege?.find((m) => m.einheit.id === einheitId && m.status === MietvertragStatus.GEPLANT);
  if (geplant) {
    return { label: "Geplant", mieter: geplant.mieter, kaltmiete: geplant.kaltmiete, className: "bg-amber-500/10 text-amber-600" };
  }
  return { label: "Leerstand", mieter: null, kaltmiete: null, className: "bg-red-500/10 text-red-500" };
}

function groupByKategorie(einheiten: Einheit[]): [string, Einheit[]][] {
  const groups = new Map<string, Einheit[]>();
  for (const e of einheiten) {
    const key = e.kategorie || "Sonstige";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }
  return Array.from(groups.entries());
}

interface ObjektEinheitenSidebarProps {
  objektId: string;
  objekt: Objekt;
  einheiten: Einheit[] | undefined;
  mietvertraege: Mietvertrag[] | undefined;
  eigentuemerschaften?: Eigentuemerschaft[];
  onNeueEinheitClick: () => void;
  neueEinheitAktiv: boolean;
  children?: React.ReactNode;
}

export function ObjektEinheitenSidebar({
  objektId,
  objekt,
  einheiten,
  mietvertraege,
  eigentuemerschaften,
  onNeueEinheitClick,
  neueEinheitAktiv,
  children,
}: ObjektEinheitenSidebarProps) {
  const params = useParams<{ einheitId?: string }>();
  const activeEinheitId = params?.einheitId;
  const istWeg = objekt.typ === ObjektTyp.WEG;

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

      {einheiten && einheiten.length === 0 && (
        <p className="rounded-lg border border-border bg-surface p-4 text-sm text-text-muted">
          Noch keine Einheiten angelegt.
        </p>
      )}
      {einheiten && einheiten.length > 0 && (
        <div className="space-y-3">
          {groupByKategorie(einheiten).map(([kategorie, gruppe]) => (
            <div key={kategorie}>
              <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-text-muted/70">
                {kategorie} · {gruppe.length}
              </p>
              <div className="overflow-hidden rounded-lg border border-border bg-surface">
                {gruppe.map((e) => {
                  const badge = statusBadge(e.id, mietvertraege);
                  const kaltmiete = badge.kaltmiete ?? e.kaltmiete;
                  const active = e.id === activeEinheitId;
                  const eigentuemer = eigentuemerschaften?.find((w) => w.einheit.id === e.id)?.eigentuemer ?? null;
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
                        {!istWeg && (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                            {badge.label}
                          </span>
                        )}
                      </div>
                      {!istWeg && (
                        <p className="mt-0.5 text-xs text-text-muted">
                          {e.flaeche != null && `${e.flaeche.toLocaleString("de-DE")} m²`}
                          {e.flaeche != null && kaltmiete != null && " · "}
                          {kaltmiete != null && `${kaltmiete.toLocaleString("de-DE")} €`}
                        </p>
                      )}
                      {istWeg && e.flaeche != null && (
                        <p className="mt-0.5 text-xs text-text-muted">{e.flaeche.toLocaleString("de-DE")} m²</p>
                      )}
                      {!istWeg && badge.mieter && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
                          <UserRound size={11} /> {kontaktName(badge.mieter)}
                        </p>
                      )}
                      {istWeg &&
                        (eigentuemer ? (
                          <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
                            <KeyRound size={11} /> {kontaktName(eigentuemer)}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-text-muted">Kein Eigentümer hinterlegt</p>
                        ))}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
