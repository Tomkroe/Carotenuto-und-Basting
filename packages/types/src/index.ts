export enum UserRole {
  OWNER = "OWNER",
  VERWALTER = "VERWALTER",
}

export interface Mandant {
  id: string;
  name: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  mandantId: string;
}

export interface RegisterRequest {
  mandantName: string;
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  mandant: Mandant;
}

export interface MeResponse {
  user: User;
  mandant: Mandant;
}

export enum ObjektTyp {
  WOHN_GESCHAEFTSHAUS = "WOHN_GESCHAEFTSHAUS",
  EINHEITEN = "EINHEITEN",
  EINFAMILIENHAUS = "EINFAMILIENHAUS",
  WEG = "WEG",
}

export interface Objekt {
  id: string;
  typ: ObjektTyp;
  name: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  land: string;
  kaltmiete: number | null;
  flaeche: number | null;
  eigenschaften: string[];
  createdAt: string;
}

export interface CreateObjektRequest {
  typ: ObjektTyp;
  name: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  land?: string;
  kaltmiete?: number;
  flaeche?: number;
  eigenschaften?: string[];
}

export type UpdateObjektRequest = Partial<CreateObjektRequest>;

export interface Einheit {
  id: string;
  name: string;
  kategorie: string;
  flaeche: number | null;
  objektId: string;
  createdAt: string;
}

export interface CreateEinheitRequest {
  name: string;
  kategorie: string;
  flaeche?: number;
}

export type UpdateEinheitRequest = Partial<CreateEinheitRequest>;

export enum KontaktTyp {
  MIETER = "MIETER",
  EIGENTUEMER = "EIGENTUEMER",
  HAUSVERWALTUNG = "HAUSVERWALTUNG",
  DIENSTLEISTER = "DIENSTLEISTER",
  SONSTIGE = "SONSTIGE",
}

export interface Kontakt {
  id: string;
  typ: KontaktTyp;
  vorname: string | null;
  nachname: string | null;
  firma: string | null;
  email: string | null;
  telefon: string | null;
  createdAt: string;
}

export interface CreateKontaktRequest {
  typ: KontaktTyp;
  vorname?: string;
  nachname?: string;
  firma?: string;
  email?: string;
  telefon?: string;
}

export type UpdateKontaktRequest = Partial<CreateKontaktRequest>;

export enum VorgangStatus {
  OFFEN = "OFFEN",
  IN_BEARBEITUNG = "IN_BEARBEITUNG",
  ABGESCHLOSSEN = "ABGESCHLOSSEN",
}

export interface ObjektRef {
  id: string;
  name: string;
}

export interface KontaktRef {
  id: string;
  vorname: string | null;
  nachname: string | null;
  firma: string | null;
}

export interface Label {
  id: string;
  name: string;
  farbe: string;
}

export interface CreateLabelRequest {
  name: string;
  farbe: string;
}

export interface Vorgang {
  id: string;
  nummer: number;
  titel: string;
  beschreibung: string | null;
  status: VorgangStatus;
  faelligkeit: string | null;
  createdAt: string;
  objekt: ObjektRef | null;
  kontakt: KontaktRef | null;
  labels: Label[];
}

export interface CreateVorgangRequest {
  titel: string;
  beschreibung?: string;
  status?: VorgangStatus;
  faelligkeit?: string;
  objektId?: string;
  kontaktId?: string;
}

export type UpdateVorgangRequest = Partial<CreateVorgangRequest>;

export interface ToDo {
  id: string;
  titel: string;
  erledigt: boolean;
  vorgangId: string;
  createdAt: string;
}

export interface CreateToDoRequest {
  titel: string;
}

export interface Kommentar {
  id: string;
  text: string;
  createdAt: string;
  autor: { id: string; name: string };
}

export interface CreateKommentarRequest {
  text: string;
}

export interface EinheitListItem {
  id: string;
  name: string;
  kategorie: string;
  flaeche: number | null;
  objektId: string;
  createdAt: string;
  objekt: { id: string; name: string };
}

export enum MietvertragStatus {
  GEPLANT = "GEPLANT",
  AKTIV = "AKTIV",
  BEENDET = "BEENDET",
}

export interface EinheitRef {
  id: string;
  name: string;
  objekt: { id: string; name: string };
}

export interface Mietvertrag {
  id: string;
  kaltmiete: number;
  nebenkostenVorauszahlung: number;
  beginn: string;
  ende: string | null;
  status: MietvertragStatus;
  createdAt: string;
  einheit: EinheitRef;
  mieter: KontaktRef;
}

export interface CreateMietvertragRequest {
  einheitId: string;
  mieterId: string;
  kaltmiete: number;
  nebenkostenVorauszahlung?: number;
  beginn: string;
  ende?: string;
  status?: MietvertragStatus;
}

export type UpdateMietvertragRequest = Partial<CreateMietvertragRequest>;

export interface Dokument {
  id: string;
  dateiname: string;
  mimeType: string;
  groesseBytes: number;
  createdAt: string;
  hochgeladenVon: { id: string; name: string };
}

export interface Eigentuemerschaft {
  id: string;
  hausgeldAnteil: number;
  anteilProzent: number | null;
  createdAt: string;
  einheit: EinheitRef;
  eigentuemer: KontaktRef;
}

export interface CreateEigentuemerschaftRequest {
  einheitId: string;
  eigentuemerId: string;
  hausgeldAnteil: number;
  anteilProzent?: number;
}

export type UpdateEigentuemerschaftRequest = Partial<CreateEigentuemerschaftRequest>;

export enum ZaehlerTyp {
  STROM = "STROM",
  GAS = "GAS",
  WASSER = "WASSER",
}

export interface Zaehler {
  id: string;
  typ: ZaehlerTyp;
  zaehlernummer: string;
  hauptzaehler: boolean;
  versorger: string | null;
  vertragsNr: string | null;
  createdAt: string;
  objekt: ObjektRef | null;
  einheit: EinheitRef | null;
}

export interface CreateZaehlerRequest {
  typ: ZaehlerTyp;
  zaehlernummer: string;
  hauptzaehler?: boolean;
  versorger?: string;
  vertragsNr?: string;
  objektId?: string;
  einheitId?: string;
}

export type UpdateZaehlerRequest = Partial<CreateZaehlerRequest>;

export interface Zaehlerstand {
  id: string;
  datum: string;
  wert: number;
  zaehlerId: string;
  createdAt: string;
}

export interface CreateZaehlerstandRequest {
  datum: string;
  wert: number;
}

export enum NebenkostenStatus {
  ENTWURF = "ENTWURF",
  VERSENDET = "VERSENDET",
}

export enum VerteilerSchluessel {
  QM = "QM",
  PERSONEN = "PERSONEN",
  VERBRAUCH = "VERBRAUCH",
  EINHEITEN = "EINHEITEN",
}

export interface Nebenkostenabrechnung {
  id: string;
  zeitraumVon: string;
  zeitraumBis: string;
  status: NebenkostenStatus;
  createdAt: string;
  objekt: ObjektRef;
}

export interface CreateNebenkostenabrechnungRequest {
  objektId: string;
  zeitraumVon: string;
  zeitraumBis: string;
  status?: NebenkostenStatus;
}

export type UpdateNebenkostenabrechnungRequest = Partial<Omit<CreateNebenkostenabrechnungRequest, "objektId">>;

export interface NebenkostenPosition {
  id: string;
  bezeichnung: string;
  betrag: number;
  verteilerschluessel: VerteilerSchluessel;
  nebenkostenabrechnungId: string;
}

export interface CreateNebenkostenPositionRequest {
  bezeichnung: string;
  betrag: number;
  verteilerschluessel: VerteilerSchluessel;
}

// ── KI-Assistent ──────────────────────────────────────────────────

export interface AssistantChatMessage {
  role: "user" | "model";
  text: string;
}

export interface AssistantAction {
  label: string;
}

export interface AssistantAttachment {
  filename: string;
  mimeType: string;
  dataBase64: string;
}

export interface AssistantEmailDraft {
  an: string;
  betreff: string;
  text: string;
}

export interface AssistantChatRequest {
  messages: AssistantChatMessage[];
  attachment?: AssistantAttachment;
}

export interface AssistantChatResponse {
  reply: string;
  actions: AssistantAction[];
  emailDraft: AssistantEmailDraft | null;
}
