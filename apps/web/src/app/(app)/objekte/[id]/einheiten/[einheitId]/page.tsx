"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Pencil, Plus, Ruler, Trash2 } from "lucide-react";
import { KontaktTyp, MietvertragStatus } from "@maklerprogram/types";
import {
  useCurrentUser,
  useObjekt,
  useEinheiten,
  useEinheit,
  useCreateEinheit,
  useUpdateEinheit,
  useMietvertraege,
  useCreateMietvertrag,
  useDeleteMietvertrag,
  useEigentuemerschaften,
  useCreateEigentuemerschaft,
  useDeleteEigentuemerschaft,
  useKontakte,
  useCreateKontakt,
} from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { ObjektEinheitenSidebar } from "@/components/ObjektEinheitenSidebar";
import { TagEditor } from "@/components/TagEditor";
import { Modal } from "@/components/Modal";

const STATUS_LABEL: Record<MietvertragStatus, { label: string; className: string }> = {
  [MietvertragStatus.GEPLANT]: { label: "Geplant", className: "bg-amber-500/10 text-amber-600" },
  [MietvertragStatus.AKTIV]: { label: "Aktiv", className: "bg-primary/10 text-primary" },
  [MietvertragStatus.BEENDET]: { label: "Beendet", className: "bg-text-muted/10 text-text-muted" },
};

function kontaktName(k: { vorname: string | null; nachname: string | null; firma: string | null }) {
  return [k.vorname, k.nachname].filter(Boolean).join(" ") || k.firma || "Unbenannt";
}

function formatDatum(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE");
}

export default function EinheitDetailPage() {
  const params = useParams<{ id: string; einheitId: string }>();
  const objektId = params.id;
  const einheitId = params.einheitId;
  const router = useRouter();

  const { isError: authError } = useCurrentUser();
  const { data: objekt } = useObjekt(objektId);
  const { data: einheiten } = useEinheiten(objektId);
  const { data: einheit, isLoading, isError: einheitError } = useEinheit(einheitId);
  const updateEinheit = useUpdateEinheit(objektId);
  const createEinheit = useCreateEinheit(objektId);
  const { data: mietvertraege } = useMietvertraege();
  const createMietvertrag = useCreateMietvertrag();
  const deleteMietvertrag = useDeleteMietvertrag();
  const { data: eigentuemerschaften } = useEigentuemerschaften();
  const createEigentuemerschaft = useCreateEigentuemerschaft();
  const deleteEigentuemerschaft = useDeleteEigentuemerschaft();
  const { data: kontakte } = useKontakte();
  const createKontakt = useCreateKontakt();

  const [showEinheitForm, setShowEinheitForm] = useState(false);
  const [einheitFormError, setEinheitFormError] = useState<string | null>(null);
  const [einheitFormName, setEinheitFormName] = useState("");
  const [einheitFormKategorie, setEinheitFormKategorie] = useState("");

  const [editingEckdaten, setEditingEckdaten] = useState(false);
  const [editFlaeche, setEditFlaeche] = useState("");
  const [editKaltmiete, setEditKaltmiete] = useState("");
  const [editZimmer, setEditZimmer] = useState("");
  const [eckdatenError, setEckdatenError] = useState<string | null>(null);

  const [showMietModal, setShowMietModal] = useState(false);
  const [mietModus, setMietModus] = useState<"bestehend" | "neu">("bestehend");
  const [mieterId, setMieterId] = useState("");
  const [neuVorname, setNeuVorname] = useState("");
  const [neuNachname, setNeuNachname] = useState("");
  const [neuTelefon, setNeuTelefon] = useState("");
  const [neuEmail, setNeuEmail] = useState("");
  const [miKaltmiete, setMiKaltmiete] = useState("");
  const [miNebenkosten, setMiNebenkosten] = useState("");
  const [miBeginn, setMiBeginn] = useState("");
  const [miEnde, setMiEnde] = useState("");
  const [miKaution, setMiKaution] = useState("");
  const [miIban, setMiIban] = useState("");
  const [miSepa, setMiSepa] = useState(false);
  const [mietError, setMietError] = useState<string | null>(null);

  const [showEigModal, setShowEigModal] = useState(false);
  const [eigModus, setEigModus] = useState<"bestehend" | "neu">("bestehend");
  const [eigentuemerId, setEigentuemerId] = useState("");
  const [neuEigVorname, setNeuEigVorname] = useState("");
  const [neuEigNachname, setNeuEigNachname] = useState("");
  const [neuEigTelefon, setNeuEigTelefon] = useState("");
  const [neuEigEmail, setNeuEigEmail] = useState("");
  const [eigHausgeldAnteil, setEigHausgeldAnteil] = useState("");
  const [eigAnteilProzent, setEigAnteilProzent] = useState("");
  const [eigError, setEigError] = useState<string | null>(null);

  useEffect(() => {
    if (authError) router.replace("/login");
  }, [authError, router]);

  useEffect(() => {
    if (einheitError) router.replace(`/objekte/${objektId}`);
  }, [einheitError, objektId, router]);

  const mieterKontakte = useMemo(() => (kontakte ?? []).filter((k) => k.typ === KontaktTyp.MIETER), [kontakte]);
  const gewaehlterKontakt = useMemo(
    () => mieterKontakte.find((k) => k.id === mieterId) ?? null,
    [mieterKontakte, mieterId],
  );

  const mietverhaeltnisse = useMemo(
    () => (mietvertraege ?? []).filter((m) => m.einheit.id === einheitId),
    [mietvertraege, einheitId],
  );

  const eigentuemerKontakte = useMemo(
    () => (kontakte ?? []).filter((k) => k.typ === KontaktTyp.EIGENTUEMER),
    [kontakte],
  );

  const eigentuemerschaftenFuerEinheit = useMemo(
    () => (eigentuemerschaften ?? []).filter((w) => w.einheit.id === einheitId),
    [eigentuemerschaften, einheitId],
  );

  function startEditEckdaten() {
    if (!einheit) return;
    setEditFlaeche(einheit.flaeche != null ? String(einheit.flaeche) : "");
    setEditKaltmiete(einheit.kaltmiete != null ? String(einheit.kaltmiete) : "");
    setEditZimmer(einheit.zimmer != null ? String(einheit.zimmer) : "");
    setEckdatenError(null);
    setEditingEckdaten(true);
  }

  async function handleSaveEckdaten(e: FormEvent) {
    e.preventDefault();
    setEckdatenError(null);
    try {
      await updateEinheit.mutateAsync({
        id: einheitId,
        data: {
          flaeche: editFlaeche ? Number(editFlaeche) : undefined,
          kaltmiete: editKaltmiete ? Number(editKaltmiete) : undefined,
          zimmer: editZimmer ? Number(editZimmer) : undefined,
        },
      });
      setEditingEckdaten(false);
    } catch (err) {
      setEckdatenError(err instanceof ApiError ? err.message : "Konnte nicht gespeichert werden.");
    }
  }

  function handleAddAusstattung(tag: string) {
    if (!einheit || einheit.ausstattung.includes(tag)) return;
    updateEinheit.mutate({ id: einheitId, data: { ausstattung: [...einheit.ausstattung, tag] } });
  }

  function handleRemoveAusstattung(tag: string) {
    if (!einheit) return;
    updateEinheit.mutate({ id: einheitId, data: { ausstattung: einheit.ausstattung.filter((t) => t !== tag) } });
  }

  function resetMietForm() {
    setMietModus("bestehend");
    setMieterId("");
    setNeuVorname("");
    setNeuNachname("");
    setNeuTelefon("");
    setNeuEmail("");
    setMiKaltmiete(einheit?.kaltmiete != null ? String(einheit.kaltmiete) : "");
    setMiNebenkosten("");
    setMiBeginn("");
    setMiEnde("");
    setMiKaution("");
    setMiIban("");
    setMiSepa(false);
    setMietError(null);
  }

  async function handleCreateMietverhaeltnis(e: FormEvent) {
    e.preventDefault();
    setMietError(null);
    try {
      let finalMieterId = mieterId;
      if (mietModus === "neu") {
        if (!neuVorname && !neuNachname) {
          setMietError("Bitte Vor- oder Nachname des neuen Kontakts angeben.");
          return;
        }
        const neuerKontakt = await createKontakt.mutateAsync({
          typ: KontaktTyp.MIETER,
          vorname: neuVorname || undefined,
          nachname: neuNachname || undefined,
          telefon: neuTelefon || undefined,
          email: neuEmail || undefined,
        });
        finalMieterId = neuerKontakt.id;
      }
      if (!finalMieterId) {
        setMietError("Bitte einen Mieter auswählen.");
        return;
      }
      await createMietvertrag.mutateAsync({
        einheitId,
        mieterId: finalMieterId,
        kaltmiete: Number(miKaltmiete),
        nebenkostenVorauszahlung: miNebenkosten ? Number(miNebenkosten) : undefined,
        kaution: miKaution ? Number(miKaution) : undefined,
        iban: miIban || undefined,
        sepaLastschrift: miSepa,
        beginn: miBeginn,
        ende: miEnde || undefined,
      });
      setShowMietModal(false);
      resetMietForm();
    } catch (err) {
      setMietError(err instanceof ApiError ? err.message : "Mietverhältnis konnte nicht angelegt werden.");
    }
  }

  function resetEigForm() {
    setEigModus("bestehend");
    setEigentuemerId("");
    setNeuEigVorname("");
    setNeuEigNachname("");
    setNeuEigTelefon("");
    setNeuEigEmail("");
    setEigHausgeldAnteil("");
    setEigAnteilProzent("");
    setEigError(null);
  }

  async function handleCreateEigentuemerschaft(e: FormEvent) {
    e.preventDefault();
    setEigError(null);
    try {
      let finalEigentuemerId = eigentuemerId;
      if (eigModus === "neu") {
        if (!neuEigVorname && !neuEigNachname) {
          setEigError("Bitte Vor- oder Nachname des neuen Kontakts angeben.");
          return;
        }
        const neuerKontakt = await createKontakt.mutateAsync({
          typ: KontaktTyp.EIGENTUEMER,
          vorname: neuEigVorname || undefined,
          nachname: neuEigNachname || undefined,
          telefon: neuEigTelefon || undefined,
          email: neuEigEmail || undefined,
        });
        finalEigentuemerId = neuerKontakt.id;
      }
      if (!finalEigentuemerId) {
        setEigError("Bitte einen Eigentümer auswählen.");
        return;
      }
      await createEigentuemerschaft.mutateAsync({
        einheitId,
        eigentuemerId: finalEigentuemerId,
        hausgeldAnteil: Number(eigHausgeldAnteil),
        anteilProzent: eigAnteilProzent ? Number(eigAnteilProzent) : undefined,
      });
      setShowEigModal(false);
      resetEigForm();
    } catch (err) {
      setEigError(err instanceof ApiError ? err.message : "Eigentümer konnte nicht hinzugefügt werden.");
    }
  }

  async function handleCreateEinheitFromSidebar(e: FormEvent) {
    e.preventDefault();
    setEinheitFormError(null);
    try {
      await createEinheit.mutateAsync({ name: einheitFormName, kategorie: einheitFormKategorie });
      setEinheitFormName("");
      setEinheitFormKategorie("");
      setShowEinheitForm(false);
    } catch (err) {
      setEinheitFormError(err instanceof ApiError ? err.message : "Einheit konnte nicht angelegt werden.");
    }
  }

  if (isLoading || !einheit || !objekt) {
    return <div className="flex min-h-[50vh] items-center justify-center text-text-muted">Lädt…</div>;
  }

  const mietePerQm = einheit.kaltmiete != null && einheit.flaeche ? einheit.kaltmiete / einheit.flaeche : null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <nav className="mb-4 flex items-center gap-2 text-sm text-text-muted">
        <Link href="/objekte" className="hover:text-primary">
          Objekte
        </Link>
        <span>/</span>
        <Link href={`/objekte/${objektId}`} className="hover:text-primary">
          {objekt.name}
        </Link>
        <span>/</span>
        <span className="text-text">{einheit.name}</span>
      </nav>

      <div className="flex flex-col gap-6 lg:flex-row">
        <ObjektEinheitenSidebar
          objektId={objektId}
          objekt={objekt}
          einheiten={einheiten}
          mietvertraege={mietvertraege}
          onNeueEinheitClick={() => setShowEinheitForm((v) => !v)}
          neueEinheitAktiv={showEinheitForm}
        >
          {showEinheitForm && (
            <form onSubmit={handleCreateEinheitFromSidebar} className="space-y-3 rounded-lg border border-border bg-surface p-4">
              <input
                type="text"
                required
                value={einheitFormName}
                onChange={(e) => setEinheitFormName(e.target.value)}
                placeholder="Name, z.B. 2. OG"
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <input
                type="text"
                required
                value={einheitFormKategorie}
                onChange={(e) => setEinheitFormKategorie(e.target.value)}
                placeholder="Kategorie"
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
              />
              {einheitFormError && <p className="text-sm text-red-500">{einheitFormError}</p>}
              <button
                type="submit"
                className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-fg transition hover:opacity-90"
              >
                Einheit anlegen
              </button>
            </form>
          )}
        </ObjektEinheitenSidebar>

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-sm text-text-muted">{einheit.kategorie}</p>
              <h1 className="mt-1 text-2xl font-semibold">{einheit.name}</h1>
            </div>
            {!editingEckdaten && (
              <button
                onClick={startEditEckdaten}
                className="text-text-muted transition hover:text-primary"
                aria-label="Eckdaten bearbeiten"
              >
                <Pencil size={18} />
              </button>
            )}
          </div>

          {editingEckdaten ? (
            <form onSubmit={handleSaveEckdaten} className="mb-8 space-y-4 rounded-lg border border-border bg-surface p-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-text-muted" htmlFor="flaeche">
                    Fläche (m²)
                  </label>
                  <input
                    id="flaeche"
                    type="number"
                    min={0}
                    step="0.1"
                    value={editFlaeche}
                    onChange={(e) => setEditFlaeche(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-text-muted" htmlFor="kaltmiete">
                    Kaltmiete (€)
                  </label>
                  <input
                    id="kaltmiete"
                    type="number"
                    min={0}
                    step="0.01"
                    value={editKaltmiete}
                    onChange={(e) => setEditKaltmiete(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-text-muted" htmlFor="zimmer">
                    Zimmer
                  </label>
                  <input
                    id="zimmer"
                    type="number"
                    min={0}
                    step="0.5"
                    value={editZimmer}
                    onChange={(e) => setEditZimmer(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
              </div>
              {eckdatenError && <p className="text-sm text-red-500">{eckdatenError}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={updateEinheit.isPending}
                  className="flex-1 rounded-lg bg-primary py-2 font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
                >
                  {updateEinheit.isPending ? "Wird gespeichert…" : "Speichern"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingEckdaten(false)}
                  className="rounded-lg border border-border px-4 py-2 text-text-muted"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Ruler size={13} /> Fläche
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {einheit.flaeche != null ? `${einheit.flaeche.toLocaleString("de-DE")} m²` : "–"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="text-xs text-text-muted">Kaltmiete</p>
                <p className="mt-1 text-lg font-semibold">
                  {einheit.kaltmiete != null ? `${einheit.kaltmiete.toLocaleString("de-DE")} €` : "–"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="text-xs text-text-muted">Zimmer</p>
                <p className="mt-1 text-lg font-semibold">{einheit.zimmer ?? "–"}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="text-xs text-text-muted">Miete / m²</p>
                <p className="mt-1 text-lg font-semibold">
                  {mietePerQm != null ? `${mietePerQm.toLocaleString("de-DE", { maximumFractionDigits: 2 })} €` : "–"}
                </p>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Ausstattung</h2>
            <TagEditor
              tags={einheit.ausstattung}
              onAdd={handleAddAusstattung}
              onRemove={handleRemoveAusstattung}
              pending={updateEinheit.isPending}
              placeholder="z.B. Einbauküche, Keller, Balkon…"
              emptyLabel="Noch keine Ausstattungsmerkmale erfasst."
            />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Mietverhältnisse</h2>
            <button
              onClick={() => {
                resetMietForm();
                setShowMietModal(true);
              }}
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-fg transition hover:opacity-90"
            >
              <Plus size={16} />
              Mietverhältnis hinzufügen
            </button>
          </div>

          {mietverhaeltnisse.length === 0 ? (
            <p className="text-text-muted">Noch kein Mietverhältnis angelegt.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-surface">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-text-muted">
                    <th className="px-4 py-2.5 font-medium">Mieter</th>
                    <th className="px-4 py-2.5 font-medium">Dauer</th>
                    <th className="px-4 py-2.5 font-medium">Kaltmiete</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mietverhaeltnisse.map((m) => (
                    <tr key={m.id}>
                      <td className="px-4 py-3">
                        <Link href={`/kontakte/${m.mieter.id}`} className="font-medium hover:text-primary">
                          {kontaktName(m.mieter)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {formatDatum(m.beginn)} {m.ende ? `– ${formatDatum(m.ende)}` : "– offen"}
                      </td>
                      <td className="px-4 py-3 text-text-muted">{m.kaltmiete.toLocaleString("de-DE")} €</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_LABEL[m.status].className}`}>
                          {STATUS_LABEL[m.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deleteMietvertrag.mutate(m.id)}
                          className="text-text-muted transition hover:text-red-500"
                          aria-label="Mietverhältnis löschen"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mb-4 mt-8 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Eigentümer</h2>
            <button
              onClick={() => {
                resetEigForm();
                setShowEigModal(true);
              }}
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-fg transition hover:opacity-90"
            >
              <Plus size={16} />
              Eigentümer hinzufügen
            </button>
          </div>

          {eigentuemerschaftenFuerEinheit.length === 0 ? (
            <p className="text-text-muted">Kein Eigentümer hinterlegt.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-surface">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-text-muted">
                    <th className="px-4 py-2.5 font-medium">Eigentümer</th>
                    <th className="px-4 py-2.5 font-medium">Hausgeld-Anteil</th>
                    <th className="px-4 py-2.5 font-medium">Miteigentumsanteil</th>
                    <th className="px-4 py-2.5 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {eigentuemerschaftenFuerEinheit.map((w) => (
                    <tr key={w.id}>
                      <td className="px-4 py-3">
                        <Link href={`/kontakte/${w.eigentuemer.id}`} className="font-medium hover:text-primary">
                          {kontaktName(w.eigentuemer)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-text-muted">{w.hausgeldAnteil.toLocaleString("de-DE")} €</td>
                      <td className="px-4 py-3 text-text-muted">
                        {w.anteilProzent != null ? `${w.anteilProzent.toLocaleString("de-DE")} %` : "–"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deleteEigentuemerschaft.mutate(w.id)}
                          className="text-text-muted transition hover:text-red-500"
                          aria-label="Eigentümer entfernen"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showMietModal && (
        <Modal title="Mietverhältnis hinzufügen" onClose={() => setShowMietModal(false)}>
          <form onSubmit={handleCreateMietverhaeltnis} className="space-y-4">
            <div className="flex gap-1 rounded-lg border border-border p-1 text-sm">
              <button
                type="button"
                onClick={() => setMietModus("bestehend")}
                className={`flex-1 rounded-md py-1.5 transition ${
                  mietModus === "bestehend" ? "bg-primary text-primary-fg" : "text-text-muted"
                }`}
              >
                Bestehender Kontakt
              </button>
              <button
                type="button"
                onClick={() => setMietModus("neu")}
                className={`flex-1 rounded-md py-1.5 transition ${
                  mietModus === "neu" ? "bg-primary text-primary-fg" : "text-text-muted"
                }`}
              >
                Neuer Kontakt
              </button>
            </div>

            {mietModus === "bestehend" ? (
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="mieterId">
                  Mieter
                </label>
                <select
                  id="mieterId"
                  value={mieterId}
                  onChange={(e) => setMieterId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">Kontakt wählen…</option>
                  {mieterKontakte.map((k) => (
                    <option key={k.id} value={k.id}>
                      {kontaktName(k)}
                    </option>
                  ))}
                </select>
                {gewaehlterKontakt && (gewaehlterKontakt.geburtsdatum || gewaehlterKontakt.adresseStrasse) && (
                  <p className="mt-2 text-xs text-text-muted">
                    {gewaehlterKontakt.geburtsdatum && `geb. ${formatDatum(gewaehlterKontakt.geburtsdatum)}`}
                    {gewaehlterKontakt.geburtsdatum && gewaehlterKontakt.adresseStrasse && " · "}
                    {gewaehlterKontakt.adresseStrasse &&
                      `${gewaehlterKontakt.adresseStrasse} ${gewaehlterKontakt.adresseHausnummer ?? ""}, ${gewaehlterKontakt.adressePlz ?? ""} ${gewaehlterKontakt.adresseOrt ?? ""}`}
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={neuVorname}
                  onChange={(e) => setNeuVorname(e.target.value)}
                  placeholder="Vorname"
                  className="rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  type="text"
                  value={neuNachname}
                  onChange={(e) => setNeuNachname(e.target.value)}
                  placeholder="Nachname"
                  className="rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  type="text"
                  value={neuTelefon}
                  onChange={(e) => setNeuTelefon(e.target.value)}
                  placeholder="Telefon"
                  className="rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  type="email"
                  value={neuEmail}
                  onChange={(e) => setNeuEmail(e.target.value)}
                  placeholder="E-Mail"
                  className="rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="miKaltmiete">
                  Kaltmiete (€)
                </label>
                <input
                  id="miKaltmiete"
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={miKaltmiete}
                  onChange={(e) => setMiKaltmiete(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="miNebenkosten">
                  NK-Vorauszahlung (€)
                </label>
                <input
                  id="miNebenkosten"
                  type="number"
                  min={0}
                  step="0.01"
                  value={miNebenkosten}
                  onChange={(e) => setMiNebenkosten(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="miBeginn">
                  Beginn
                </label>
                <input
                  id="miBeginn"
                  type="date"
                  required
                  value={miBeginn}
                  onChange={(e) => setMiBeginn(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="miEnde">
                  Ende (optional)
                </label>
                <input
                  id="miEnde"
                  type="date"
                  value={miEnde}
                  onChange={(e) => setMiEnde(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="miKaution">
                  Kaution (€, optional)
                </label>
                <input
                  id="miKaution"
                  type="number"
                  min={0}
                  step="0.01"
                  value={miKaution}
                  onChange={(e) => setMiKaution(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="miIban">
                  IBAN (optional)
                </label>
                <input
                  id="miIban"
                  type="text"
                  value={miIban}
                  onChange={(e) => setMiIban(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={miSepa}
                onChange={(e) => setMiSepa(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              SEPA-Lastschriftmandat vorhanden
            </label>

            {mietError && <p className="text-sm text-red-500">{mietError}</p>}

            <button
              type="submit"
              disabled={createMietvertrag.isPending || createKontakt.isPending}
              className="w-full rounded-lg bg-primary py-2 font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
            >
              {createMietvertrag.isPending || createKontakt.isPending ? "Wird angelegt…" : "Mietverhältnis anlegen"}
            </button>
          </form>
        </Modal>
      )}

      {showEigModal && (
        <Modal title="Eigentümer hinzufügen" onClose={() => setShowEigModal(false)}>
          <form onSubmit={handleCreateEigentuemerschaft} className="space-y-4">
            <div className="flex gap-1 rounded-lg border border-border p-1 text-sm">
              <button
                type="button"
                onClick={() => setEigModus("bestehend")}
                className={`flex-1 rounded-md py-1.5 transition ${
                  eigModus === "bestehend" ? "bg-primary text-primary-fg" : "text-text-muted"
                }`}
              >
                Bestehender Kontakt
              </button>
              <button
                type="button"
                onClick={() => setEigModus("neu")}
                className={`flex-1 rounded-md py-1.5 transition ${
                  eigModus === "neu" ? "bg-primary text-primary-fg" : "text-text-muted"
                }`}
              >
                Neuer Kontakt
              </button>
            </div>

            {eigModus === "bestehend" ? (
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="eigentuemerId">
                  Eigentümer
                </label>
                <select
                  id="eigentuemerId"
                  value={eigentuemerId}
                  onChange={(e) => setEigentuemerId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">Kontakt wählen…</option>
                  {eigentuemerKontakte.map((k) => (
                    <option key={k.id} value={k.id}>
                      {kontaktName(k)}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={neuEigVorname}
                  onChange={(e) => setNeuEigVorname(e.target.value)}
                  placeholder="Vorname"
                  className="rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  type="text"
                  value={neuEigNachname}
                  onChange={(e) => setNeuEigNachname(e.target.value)}
                  placeholder="Nachname"
                  className="rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  type="text"
                  value={neuEigTelefon}
                  onChange={(e) => setNeuEigTelefon(e.target.value)}
                  placeholder="Telefon"
                  className="rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  type="email"
                  value={neuEigEmail}
                  onChange={(e) => setNeuEigEmail(e.target.value)}
                  placeholder="E-Mail"
                  className="rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="eigHausgeldAnteil">
                  Hausgeld-Anteil (€)
                </label>
                <input
                  id="eigHausgeldAnteil"
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={eigHausgeldAnteil}
                  onChange={(e) => setEigHausgeldAnteil(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="eigAnteilProzent">
                  Miteigentumsanteil (%, optional)
                </label>
                <input
                  id="eigAnteilProzent"
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={eigAnteilProzent}
                  onChange={(e) => setEigAnteilProzent(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            {eigError && <p className="text-sm text-red-500">{eigError}</p>}

            <button
              type="submit"
              disabled={createEigentuemerschaft.isPending || createKontakt.isPending}
              className="w-full rounded-lg bg-primary py-2 font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
            >
              {createEigentuemerschaft.isPending || createKontakt.isPending ? "Wird hinzugefügt…" : "Eigentümer hinzufügen"}
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
