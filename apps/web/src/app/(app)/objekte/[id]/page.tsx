"use client";

import { useEffect, useMemo, useRef, useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Building2,
  ImagePlus,
  KeyRound,
  Landmark,
  Pencil,
  Phone,
  Ruler,
  Sparkles,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import { KontaktTyp, MietvertragStatus, ObjektTyp } from "@maklerprogram/types";
import {
  useCurrentUser,
  useObjekt,
  useUpdateObjekt,
  useEinheiten,
  useCreateEinheit,
  useDeleteObjekt,
  useMietvertraege,
  useEigentuemerschaften,
  useKontakte,
  useUploadObjektTitelbild,
  useDeleteObjektTitelbild,
} from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { DokumenteSection } from "@/components/DokumenteSection";
import { ObjektEinheitenSidebar } from "@/components/ObjektEinheitenSidebar";
import { TagEditor } from "@/components/TagEditor";

const OBJEKT_TYP_LABEL: Record<ObjektTyp, string> = {
  [ObjektTyp.WOHN_GESCHAEFTSHAUS]: "Wohn-/Geschäftshaus",
  [ObjektTyp.EINHEITEN]: "Einheiten",
  [ObjektTyp.EINFAMILIENHAUS]: "Einfamilienhaus",
  [ObjektTyp.WEG]: "WEG",
};

function kontaktName(k: { vorname: string | null; nachname: string | null; firma: string | null }) {
  return [k.vorname, k.nachname].filter(Boolean).join(" ") || k.firma || "Unbenannt";
}

function formatTagMonat(value: string | null): string {
  if (!value) return "–";
  const [tag, monat] = value.split("-");
  return `${tag}.${monat}.`;
}

export default function ObjektDetailPage() {
  const params = useParams<{ id: string }>();
  const objektId = params.id;
  const router = useRouter();

  const { isError: authError } = useCurrentUser();
  const { data: objekt, isLoading, isError: objektError } = useObjekt(objektId);
  const updateObjekt = useUpdateObjekt(objektId);
  const { data: einheiten } = useEinheiten(objektId);
  const createEinheit = useCreateEinheit(objektId);
  const deleteObjekt = useDeleteObjekt();
  const uploadTitelbild = useUploadObjektTitelbild(objektId);
  const deleteTitelbild = useDeleteObjektTitelbild(objektId);
  const { data: mietvertraege } = useMietvertraege();
  const { data: eigentuemerschaften } = useEigentuemerschaften();
  const { data: kontakte } = useKontakte();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showEinheitForm, setShowEinheitForm] = useState(false);
  const [einheitName, setEinheitName] = useState("");
  const [einheitKategorie, setEinheitKategorie] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [editingObjekt, setEditingObjekt] = useState(false);
  const [editTyp, setEditTyp] = useState<ObjektTyp>(ObjektTyp.EINFAMILIENHAUS);
  const [editName, setEditName] = useState("");
  const [editStrasse, setEditStrasse] = useState("");
  const [editHausnummer, setEditHausnummer] = useState("");
  const [editPlz, setEditPlz] = useState("");
  const [editOrt, setEditOrt] = useState("");
  const [editKaltmiete, setEditKaltmiete] = useState("");
  const [editFlaeche, setEditFlaeche] = useState("");
  const [editHausgeld, setEditHausgeld] = useState("");
  const [editAbrechnungszeitraumStart, setEditAbrechnungszeitraumStart] = useState("");
  const [editAbrechnungszeitraumEnde, setEditAbrechnungszeitraumEnde] = useState("");
  const [editBankKontoinhaber, setEditBankKontoinhaber] = useState("");
  const [editBankIban, setEditBankIban] = useState("");
  const [editBankBic, setEditBankBic] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"uebersicht" | "abrechnungsdaten" | "eigenschaften">("uebersicht");
  const titelbildInputRef = useRef<HTMLInputElement>(null);
  const [showAnsprechpartnerForm, setShowAnsprechpartnerForm] = useState(false);
  const [ansprechpartnerAuswahl, setAnsprechpartnerAuswahl] = useState("");

  useEffect(() => {
    if (authError) router.replace("/login");
  }, [authError, router]);

  useEffect(() => {
    if (objektError) router.replace("/objekte");
  }, [objektError, router]);

  const gesamtflaeche = useMemo(() => {
    if (!einheiten || einheiten.length === 0) return objekt?.flaeche ?? null;
    const sum = einheiten.reduce((acc, e) => acc + (e.flaeche ?? 0), 0);
    return sum > 0 ? sum : objekt?.flaeche ?? null;
  }, [einheiten, objekt]);

  const sevAnzahl = useMemo(() => {
    if (!einheiten || !eigentuemerschaften) return 0;
    const einheitIds = new Set(einheiten.map((e) => e.id));
    const mitSev = new Set(
      eigentuemerschaften.filter((w) => einheitIds.has(w.einheit.id)).map((w) => w.einheit.id),
    );
    return mitSev.size;
  }, [einheiten, eigentuemerschaften]);

  const hausverwaltungKontakte = useMemo(
    () => (kontakte ?? []).filter((k) => k.typ === KontaktTyp.HAUSVERWALTUNG || k.typ === KontaktTyp.DIENSTLEISTER),
    [kontakte],
  );

  async function handleDeleteObjekt() {
    await deleteObjekt.mutateAsync(objektId);
    router.replace("/objekte");
  }

  async function handleCreateEinheit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createEinheit.mutateAsync({ name: einheitName, kategorie: einheitKategorie });
      setEinheitName("");
      setEinheitKategorie("");
      setShowEinheitForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Einheit konnte nicht angelegt werden.");
    }
  }

  function startEditObjekt() {
    if (!objekt) return;
    setEditTyp(objekt.typ);
    setEditName(objekt.name);
    setEditStrasse(objekt.strasse);
    setEditHausnummer(objekt.hausnummer);
    setEditPlz(objekt.plz);
    setEditOrt(objekt.ort);
    setEditKaltmiete(objekt.kaltmiete != null ? String(objekt.kaltmiete) : "");
    setEditFlaeche(objekt.flaeche != null ? String(objekt.flaeche) : "");
    setEditHausgeld(objekt.hausgeld != null ? String(objekt.hausgeld) : "");
    setEditAbrechnungszeitraumStart(objekt.abrechnungszeitraumStart ?? "01-01");
    setEditAbrechnungszeitraumEnde(objekt.abrechnungszeitraumEnde ?? "31-12");
    setEditBankKontoinhaber(objekt.bankKontoinhaber ?? "");
    setEditBankIban(objekt.bankIban ?? "");
    setEditBankBic(objekt.bankBic ?? "");
    setEditError(null);
    setEditingObjekt(true);
  }

  async function handleSaveObjekt(e: FormEvent) {
    e.preventDefault();
    setEditError(null);
    try {
      await updateObjekt.mutateAsync({
        typ: editTyp,
        name: editName,
        strasse: editStrasse,
        hausnummer: editHausnummer,
        plz: editPlz,
        ort: editOrt,
        kaltmiete: editKaltmiete ? Number(editKaltmiete) : undefined,
        flaeche: editFlaeche ? Number(editFlaeche) : undefined,
        hausgeld: editHausgeld ? Number(editHausgeld) : undefined,
        abrechnungszeitraumStart: editAbrechnungszeitraumStart || undefined,
        abrechnungszeitraumEnde: editAbrechnungszeitraumEnde || undefined,
        bankKontoinhaber: editBankKontoinhaber || undefined,
        bankIban: editBankIban || undefined,
        bankBic: editBankBic || undefined,
      });
      setEditingObjekt(false);
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : "Objekt konnte nicht gespeichert werden.");
    }
  }

  function handleTitelbildChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadTitelbild.mutate(file);
    e.target.value = "";
  }

  function handleAddEigenschaft(tag: string) {
    if (!objekt || objekt.eigenschaften.includes(tag)) return;
    updateObjekt.mutate({ eigenschaften: [...objekt.eigenschaften, tag] });
  }

  function handleRemoveEigenschaft(tag: string) {
    if (!objekt) return;
    updateObjekt.mutate({ eigenschaften: objekt.eigenschaften.filter((t) => t !== tag) });
  }

  function handleSetAnsprechpartner(e: FormEvent) {
    e.preventDefault();
    if (!ansprechpartnerAuswahl) return;
    updateObjekt.mutate({ ansprechpartnerId: ansprechpartnerAuswahl });
    setShowAnsprechpartnerForm(false);
    setAnsprechpartnerAuswahl("");
  }

  if (isLoading || !objekt) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-text-muted">Lädt…</div>
    );
  }

  const istWeg = objekt.typ === ObjektTyp.WEG;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <nav className="mb-4 flex items-center gap-2 text-sm text-text-muted">
        <Link href="/objekte" className="hover:text-primary">
          Objekte
        </Link>
        <span>/</span>
        <span className="text-text">{objekt.name}</span>
      </nav>

      <input
        ref={titelbildInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleTitelbildChange}
      />
      {objekt.titelbildUrl ? (
        <div className="group relative mb-6 h-48 w-full overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={objekt.titelbildUrl} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-start justify-end gap-2 bg-black/0 p-3 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
            <button
              onClick={() => titelbildInputRef.current?.click()}
              className="rounded-full bg-white/90 p-2 text-text transition hover:bg-white"
              aria-label="Titelbild ändern"
            >
              <ImagePlus size={16} />
            </button>
            <button
              onClick={() => deleteTitelbild.mutate()}
              className="rounded-full bg-white/90 p-2 text-red-500 transition hover:bg-white"
              aria-label="Titelbild entfernen"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => titelbildInputRef.current?.click()}
          disabled={uploadTitelbild.isPending}
          className="mb-6 flex h-24 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm text-text-muted transition hover:border-primary hover:text-primary disabled:opacity-50"
        >
          <ImagePlus size={16} />
          {uploadTitelbild.isPending ? "Wird hochgeladen…" : "Titelbild hinzufügen"}
        </button>
      )}

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
            <form
              onSubmit={handleCreateEinheit}
              className="space-y-3 rounded-lg border border-border bg-surface p-4"
            >
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="einheitName">
                  Name
                </label>
                <input
                  id="einheitName"
                  type="text"
                  required
                  value={einheitName}
                  onChange={(e) => setEinheitName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="z.B. 1. OG"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="einheitKategorie">
                  Kategorie
                </label>
                <input
                  id="einheitKategorie"
                  type="text"
                  required
                  value={einheitKategorie}
                  onChange={(e) => setEinheitKategorie(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="z.B. Wohnung, Gewerbe, Stellplatz"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={createEinheit.isPending}
                className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
              >
                {createEinheit.isPending ? "Wird angelegt…" : "Einheit anlegen"}
              </button>
            </form>
          )}
        </ObjektEinheitenSidebar>

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-start justify-between">
            {!editingObjekt ? (
              <div>
                <p className="text-sm text-text-muted">{OBJEKT_TYP_LABEL[objekt.typ]}</p>
                <h1 className="mt-1 text-2xl font-semibold">{objekt.name}</h1>
                <p className="mt-1 text-text-muted">
                  {objekt.strasse} {objekt.hausnummer}, {objekt.plz} {objekt.ort}
                </p>
              </div>
            ) : (
              <div className="w-full max-w-lg" />
            )}

            {!editingObjekt && (
              <div className="flex items-center gap-3">
                {!confirmDelete && (
                  <button
                    onClick={startEditObjekt}
                    className="text-text-muted transition hover:text-primary"
                    aria-label="Objekt bearbeiten"
                  >
                    <Pencil size={18} />
                  </button>
                )}
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="rounded-full border border-border px-3 py-1.5 text-sm text-text-muted transition hover:border-red-500 hover:text-red-500"
                  >
                    Löschen
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-text-muted">Wirklich löschen?</span>
                    <button
                      onClick={handleDeleteObjekt}
                      disabled={deleteObjekt.isPending}
                      className="rounded-full bg-red-500 px-3 py-1.5 text-white transition hover:opacity-90 disabled:opacity-50"
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

          {editingObjekt && (
            <form onSubmit={handleSaveObjekt} className="mb-6 space-y-4 rounded-lg border border-border bg-surface p-4">
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="editTyp">
                  Typ
                </label>
                <select
                  id="editTyp"
                  value={editTyp}
                  onChange={(e) => setEditTyp(e.target.value as ObjektTyp)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                >
                  {Object.values(ObjektTyp).map((t) => (
                    <option key={t} value={t}>
                      {OBJEKT_TYP_LABEL[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="editName">
                  Name
                </label>
                <input
                  id="editName"
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-3">
                <div>
                  <label className="mb-1 block text-sm text-text-muted" htmlFor="editStrasse">
                    Straße
                  </label>
                  <input
                    id="editStrasse"
                    type="text"
                    required
                    value={editStrasse}
                    onChange={(e) => setEditStrasse(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-text-muted" htmlFor="editHausnummer">
                    Nr.
                  </label>
                  <input
                    id="editHausnummer"
                    type="text"
                    required
                    value={editHausnummer}
                    onChange={(e) => setEditHausnummer(e.target.value)}
                    className="w-20 rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-3">
                <div>
                  <label className="mb-1 block text-sm text-text-muted" htmlFor="editPlz">
                    PLZ
                  </label>
                  <input
                    id="editPlz"
                    type="text"
                    required
                    value={editPlz}
                    onChange={(e) => setEditPlz(e.target.value)}
                    className="w-24 rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-text-muted" htmlFor="editOrt">
                    Ort
                  </label>
                  <input
                    id="editOrt"
                    type="text"
                    required
                    value={editOrt}
                    onChange={(e) => setEditOrt(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-text-muted" htmlFor="editKaltmiete">
                    Kaltmiete (€)
                  </label>
                  <input
                    id="editKaltmiete"
                    type="number"
                    min={0}
                    step="0.01"
                    value={editKaltmiete}
                    onChange={(e) => setEditKaltmiete(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-text-muted" htmlFor="editFlaeche">
                    Fläche (m²)
                  </label>
                  <input
                    id="editFlaeche"
                    type="number"
                    min={0}
                    step="0.1"
                    value={editFlaeche}
                    onChange={(e) => setEditFlaeche(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
              </div>
              {editTyp === ObjektTyp.WEG && (
                <div>
                  <label className="mb-1 block text-sm text-text-muted" htmlFor="editHausgeld">
                    Hausgeld gesamt (€)
                  </label>
                  <input
                    id="editHausgeld"
                    type="number"
                    min={0}
                    step="0.01"
                    value={editHausgeld}
                    onChange={(e) => setEditHausgeld(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
              )}

              <div>
                <p className="mb-1 text-sm text-text-muted">Abrechnungszeitraum für Betriebskosten (TT-MM)</p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="01-01"
                    pattern="\d{2}-\d{2}"
                    value={editAbrechnungszeitraumStart}
                    onChange={(e) => setEditAbrechnungszeitraumStart(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="31-12"
                    pattern="\d{2}-\d{2}"
                    value={editAbrechnungszeitraumEnde}
                    onChange={(e) => setEditAbrechnungszeitraumEnde(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Bankkonto des Objekts (optional)</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Kontoinhaber"
                      value={editBankKontoinhaber}
                      onChange={(e) => setEditBankKontoinhaber(e.target.value)}
                      className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      placeholder="IBAN"
                      value={editBankIban}
                      onChange={(e) => setEditBankIban(e.target.value)}
                      className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="BIC"
                    value={editBankBic}
                    onChange={(e) => setEditBankBic(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
              </div>

              {editError && <p className="text-sm text-red-500">{editError}</p>}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={updateObjekt.isPending}
                  className="flex-1 rounded-lg bg-primary py-2 font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
                >
                  {updateObjekt.isPending ? "Wird gespeichert…" : "Speichern"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingObjekt(false)}
                  className="rounded-lg border border-border px-4 py-2 text-text-muted"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          )}

          <div className="mb-6 flex gap-1 border-b border-border">
            <button
              onClick={() => setActiveTab("uebersicht")}
              className={`px-3 py-2 text-sm font-medium transition ${
                activeTab === "uebersicht"
                  ? "border-b-2 border-primary text-primary"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Übersicht
            </button>
            <button
              onClick={() => setActiveTab("abrechnungsdaten")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition ${
                activeTab === "abrechnungsdaten"
                  ? "border-b-2 border-primary text-primary"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <Landmark size={14} />
              Abrechnungsdaten
            </button>
            <button
              onClick={() => setActiveTab("eigenschaften")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition ${
                activeTab === "eigenschaften"
                  ? "border-b-2 border-primary text-primary"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <Sparkles size={14} />
              Eigenschaften
              {objekt.eigenschaften.length > 0 && (
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                  {objekt.eigenschaften.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === "abrechnungsdaten" && (
            <div className="mb-8 space-y-6">
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
                  Abrechnungszeitraum für Betriebskosten
                </h2>
                <div className="flex items-center gap-6 rounded-lg border border-border bg-surface p-4 text-sm">
                  <span>
                    <span className="text-text-muted">Anfang: </span>
                    {formatTagMonat(objekt.abrechnungszeitraumStart)}
                  </span>
                  <span>
                    <span className="text-text-muted">Ende: </span>
                    {formatTagMonat(objekt.abrechnungszeitraumEnde)}
                  </span>
                </div>
              </div>

              <div>
                <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-text-muted">
                  <Building2 size={14} />
                  Bankkonto des Objekts
                </h2>
                {objekt.bankIban || objekt.bankKontoinhaber ? (
                  <div className="grid grid-cols-3 gap-4 rounded-lg border border-border bg-surface p-4 text-sm">
                    <div>
                      <p className="text-xs text-text-muted">Kontoinhaber</p>
                      <p className="mt-0.5">{objekt.bankKontoinhaber || "–"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">IBAN</p>
                      <p className="mt-0.5">{objekt.bankIban || "–"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">BIC</p>
                      <p className="mt-0.5">{objekt.bankBic || "–"}</p>
                    </div>
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed border-border p-4 text-sm text-text-muted">
                    Kein Bankkonto hinterlegt. Über den Bearbeiten-Stift oben ergänzbar.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "eigenschaften" && (
            <div className="mb-8">
              <TagEditor
                tags={objekt.eigenschaften}
                onAdd={handleAddEigenschaft}
                onRemove={handleRemoveEigenschaft}
                pending={updateObjekt.isPending}
                placeholder="z.B. Keller, Balkon, Stellplatz…"
                emptyLabel="Noch keine Eigenschaften erfasst."
              />
            </div>
          )}

          {activeTab === "uebersicht" && (
            <>
              <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg border border-border bg-surface p-4">
                  <p className="flex items-center gap-1.5 text-xs text-text-muted">
                    <Ruler size={13} /> Fläche
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {gesamtflaeche != null ? `${gesamtflaeche.toLocaleString("de-DE")} m²` : "–"}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-surface p-4">
                  <p className="flex items-center gap-1.5 text-xs text-text-muted">
                    <UsersRound size={13} /> Einheiten
                  </p>
                  <p className="mt-1 text-lg font-semibold">{einheiten?.length ?? 0}</p>
                </div>
                {istWeg && (
                  <>
                    <div className="rounded-lg border border-border bg-surface p-4">
                      <p className="text-xs text-text-muted">Hausgeld gesamt</p>
                      <p className="mt-1 text-lg font-semibold">
                        {objekt.hausgeld != null ? `${objekt.hausgeld.toLocaleString("de-DE")} €` : "–"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-surface p-4">
                      <p className="flex items-center gap-1.5 text-xs text-text-muted">
                        <KeyRound size={13} /> Mit SEV
                      </p>
                      <p className="mt-1 text-lg font-semibold">
                        {sevAnzahl} / {einheiten?.length ?? 0}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="mb-8">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
                  Ansprechpartner
                </h2>
                {objekt.ansprechpartner ? (
                  <Link
                    href={`/kontakte/${objekt.ansprechpartner.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition hover:border-primary"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Phone size={15} />
                    </span>
                    <span>
                      <span className="block font-medium">{kontaktName(objekt.ansprechpartner)}</span>
                      <span className="block text-xs text-text-muted">Hausverwaltung / Ansprechpartner</span>
                    </span>
                  </Link>
                ) : showAnsprechpartnerForm ? (
                  <form
                    onSubmit={handleSetAnsprechpartner}
                    className="flex items-center gap-2 rounded-lg border border-border bg-surface p-4"
                  >
                    <select
                      value={ansprechpartnerAuswahl}
                      onChange={(e) => setAnsprechpartnerAuswahl(e.target.value)}
                      required
                      className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                    >
                      <option value="">Kontakt wählen…</option>
                      {hausverwaltungKontakte.map((k) => (
                        <option key={k.id} value={k.id}>
                          {kontaktName(k)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={updateObjekt.isPending}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition hover:opacity-90 disabled:opacity-50"
                    >
                      Speichern
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAnsprechpartnerForm(false)}
                      className="rounded-lg border border-border px-3 py-2 text-sm text-text-muted"
                    >
                      Abbrechen
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowAnsprechpartnerForm(true)}
                    className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border p-4 text-sm text-text-muted transition hover:border-primary hover:text-primary"
                  >
                    <Phone size={15} />
                    Ansprechpartner hinzufügen
                    {hausverwaltungKontakte.length === 0 && (
                      <span className="ml-auto text-xs">
                        (erst als Kontakt vom Typ „Hausverwaltung“ anlegen)
                      </span>
                    )}
                  </button>
                )}
              </div>

              <div className="mt-8">
                <DokumenteSection parent={{ path: "objekte", id: objektId }} />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
