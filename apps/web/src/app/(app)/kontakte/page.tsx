"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Download,
  HardHat,
  KeyRound,
  Mail,
  Phone,
  Plus,
  Sparkles,
  UserRound,
  Wrench,
} from "lucide-react";
import { KontaktTyp } from "@maklerprogram/types";
import { useCurrentUser, useKontakte, useCreateKontakt } from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { downloadCsv } from "@/lib/csvExport";
import { StatCard } from "@/components/StatCard";
import { SearchInput } from "@/components/SearchInput";
import { DataTable } from "@/components/DataTable";
import { Modal } from "@/components/Modal";

const KONTAKT_TYP_META: Record<
  KontaktTyp,
  { label: string; icon: typeof UserRound; className: string }
> = {
  [KontaktTyp.MIETER]: {
    label: "Mieter",
    icon: UserRound,
    className: "bg-blue-500/10 text-blue-500",
  },
  [KontaktTyp.EIGENTUEMER]: {
    label: "Eigentümer",
    icon: KeyRound,
    className: "bg-amber-500/10 text-amber-500",
  },
  [KontaktTyp.HAUSVERWALTUNG]: {
    label: "Hausverwaltung",
    icon: Building2,
    className: "bg-violet-500/10 text-violet-500",
  },
  [KontaktTyp.DIENSTLEISTER]: {
    label: "Dienstleister",
    icon: Wrench,
    className: "bg-emerald-500/10 text-emerald-500",
  },
  [KontaktTyp.HAUSMEISTER]: {
    label: "Hausmeister",
    icon: HardHat,
    className: "bg-orange-500/10 text-orange-500",
  },
  [KontaktTyp.SONSTIGE]: {
    label: "Sonstige",
    icon: Sparkles,
    className: "bg-text-muted/10 text-text-muted",
  },
};

export default function KontaktePage() {
  const router = useRouter();
  const { isError: authError } = useCurrentUser();
  const { data: kontakte, isLoading } = useKontakte();
  const createKontakt = useCreateKontakt();

  const [showForm, setShowForm] = useState(false);
  const [typ, setTyp] = useState<KontaktTyp>(KontaktTyp.MIETER);
  const [typBezeichnung, setTypBezeichnung] = useState("");
  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [firma, setFirma] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [debitorNr, setDebitorNr] = useState("");
  const [kreditorNr, setKreditorNr] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (authError) router.replace("/login");
  }, [authError, router]);

  const gefilterteKontakte = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return kontakte ?? [];
    return (kontakte ?? []).filter((k) =>
      [k.vorname, k.nachname, k.firma, k.email].filter(Boolean).some((f) => f!.toLowerCase().includes(query)),
    );
  }, [kontakte, search]);

  function handleExport() {
    downloadCsv(
      "kontakte.csv",
      ["Name", "Typ", "Straße", "Hausnummer", "PLZ", "Ort", "E-Mail", "Telefon", "Debitor-Nr.", "Kreditor-Nr."],
      gefilterteKontakte.map((k) => [
        [k.vorname, k.nachname].filter(Boolean).join(" ") || k.firma || "Unbenannt",
        k.typ === KontaktTyp.SONSTIGE && k.typBezeichnung ? k.typBezeichnung : KONTAKT_TYP_META[k.typ].label,
        k.adresseStrasse ?? "",
        k.adresseHausnummer ?? "",
        k.adressePlz ?? "",
        k.adresseOrt ?? "",
        k.email ?? "",
        k.telefon ?? "",
        k.debitorNr ?? "",
        k.kreditorNr ?? "",
      ]),
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createKontakt.mutateAsync({
        typ,
        typBezeichnung: typ === KontaktTyp.SONSTIGE ? typBezeichnung || undefined : undefined,
        vorname: vorname || undefined,
        nachname: nachname || undefined,
        firma: firma || undefined,
        email: email || undefined,
        telefon: telefon || undefined,
        debitorNr: debitorNr || undefined,
        kreditorNr: kreditorNr || undefined,
      });
      setTypBezeichnung("");
      setVorname("");
      setNachname("");
      setFirma("");
      setEmail("");
      setTelefon("");
      setDebitorNr("");
      setKreditorNr("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kontakt konnte nicht angelegt werden.");
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Kontakte</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm font-medium text-text transition hover:bg-surface"
          >
            <Download size={16} /> Exportieren
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-fg transition hover:opacity-90"
          >
            <Plus size={16} /> Neuer Kontakt
          </button>
        </div>
      </div>

      <div className="mb-6">
        <StatCard value={kontakte?.length ?? 0} label="Kontakte" />
      </div>

      {showForm && (
        <Modal title="Neuer Kontakt" onClose={() => setShowForm(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-text-muted" htmlFor="typ">
              Typ
            </label>
            <select
              id="typ"
              value={typ}
              onChange={(e) => setTyp(e.target.value as KontaktTyp)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
            >
              {Object.values(KontaktTyp).map((t) => (
                <option key={t} value={t}>
                  {KONTAKT_TYP_META[t].label}
                </option>
              ))}
            </select>
          </div>
          {typ === KontaktTyp.SONSTIGE && (
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="typBezeichnung">
                Eigene Bezeichnung (optional)
              </label>
              <input
                id="typBezeichnung"
                type="text"
                value={typBezeichnung}
                onChange={(e) => setTypBezeichnung(e.target.value)}
                placeholder="z. B. Notar, Versicherung…"
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="vorname">
                Vorname
              </label>
              <input
                id="vorname"
                type="text"
                value={vorname}
                onChange={(e) => setVorname(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="nachname">
                Nachname
              </label>
              <input
                id="nachname"
                type="text"
                value={nachname}
                onChange={(e) => setNachname(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted" htmlFor="firma">
              Firma (optional)
            </label>
            <input
              id="firma"
              type="text"
              value={firma}
              onChange={(e) => setFirma(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="email">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="telefon">
                Telefon
              </label>
              <input
                id="telefon"
                type="tel"
                value={telefon}
                onChange={(e) => setTelefon(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="debitorNr">
                Debitor-Nr. (optional)
              </label>
              <input
                id="debitorNr"
                type="text"
                value={debitorNr}
                onChange={(e) => setDebitorNr(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-muted" htmlFor="kreditorNr">
                Kreditor-Nr. (optional)
              </label>
              <input
                id="kreditorNr"
                type="text"
                value={kreditorNr}
                onChange={(e) => setKreditorNr(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={createKontakt.isPending}
            className="w-full rounded-lg bg-primary py-2 font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
          >
            {createKontakt.isPending ? "Wird angelegt…" : "Kontakt anlegen"}
          </button>
        </form>
        </Modal>
      )}

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Kontakte durchsuchen…" />
      </div>

      {isLoading && <p className="text-text-muted">Lädt…</p>}

      {kontakte && kontakte.length === 0 && !showForm && (
        <p className="text-text-muted">Noch keine Kontakte angelegt.</p>
      )}

      {gefilterteKontakte.length > 0 && (
        <DataTable
          columns={[
            { key: "name", header: "Name" },
            { key: "typ", header: "Typ" },
            { key: "adresse", header: "Adresse" },
            { key: "kontakt", header: "Kontakt" },
          ]}
        >
          {gefilterteKontakte.map((k) => {
            const meta = KONTAKT_TYP_META[k.typ];
            const Icon = meta.icon;
            const displayName = [k.vorname, k.nachname].filter(Boolean).join(" ") || k.firma || "Unbenannt";

            return (
              <tr
                key={k.id}
                onClick={() => router.push(`/kontakte/${k.id}`)}
                className="cursor-pointer transition hover:bg-bg"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full ${meta.className}`}>
                      <Icon size={15} />
                    </span>
                    <div>
                      <p className="font-medium">{displayName}</p>
                      {(k.kreditorNr || k.debitorNr) && (
                        <p className="text-xs text-text-muted">
                          {k.kreditorNr && `Kreditor-ID: ${k.kreditorNr}`}
                          {k.kreditorNr && k.debitorNr && " | "}
                          {k.debitorNr && `Debitor-ID: ${k.debitorNr}`}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {k.typ === KontaktTyp.SONSTIGE && k.typBezeichnung ? k.typBezeichnung : meta.label}
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {k.adresseStrasse || k.adresseOrt ? (
                    <>
                      {[k.adresseStrasse, k.adresseHausnummer].filter(Boolean).join(" ")}
                      {(k.adresseStrasse || k.adresseHausnummer) && (k.adressePlz || k.adresseOrt) && <br />}
                      {[k.adressePlz, k.adresseOrt].filter(Boolean).join(" ")}
                    </>
                  ) : (
                    "–"
                  )}
                </td>
                <td className="px-4 py-3 text-text-muted">
                  <div className="flex flex-col gap-0.5 text-xs">
                    {k.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={12} /> {k.email}
                      </span>
                    )}
                    {k.telefon && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} /> {k.telefon}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </DataTable>
      )}
    </section>
  );
}
