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

export interface UserListItem {
  id: string;
  name: string;
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
  hausgeld: number | null;
  eigenschaften: string[];
  ansprechpartner: KontaktRef | null;
  titelbildUrl: string | null;
  abrechnungszeitraumStart: string | null;
  abrechnungszeitraumEnde: string | null;
  bankKontoinhaber: string | null;
  bankIban: string | null;
  bankBic: string | null;
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
  hausgeld?: number;
  eigenschaften?: string[];
  ansprechpartnerId?: string;
  abrechnungszeitraumStart?: string;
  abrechnungszeitraumEnde?: string;
  bankKontoinhaber?: string;
  bankIban?: string;
  bankBic?: string;
}

export type UpdateObjektRequest = Partial<CreateObjektRequest>;

export interface Einheit {
  id: string;
  name: string;
  kategorie: string;
  flaeche: number | null;
  kaltmiete: number | null;
  zimmer: number | null;
  ausstattung: string[];
  objektId: string;
  objekt?: ObjektRef;
  createdAt: string;
}

export interface CreateEinheitRequest {
  name: string;
  kategorie: string;
  flaeche?: number;
  kaltmiete?: number;
  zimmer?: number;
  ausstattung?: string[];
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
  debitorNr: string | null;
  kreditorNr: string | null;
  geburtsdatum: string | null;
  adresseStrasse: string | null;
  adresseHausnummer: string | null;
  adressePlz: string | null;
  adresseOrt: string | null;
  notizen: string | null;
  bankKontoinhaber: string | null;
  bankName: string | null;
  bankIban: string | null;
  bankBic: string | null;
  bankGlaeubigerId: string | null;
  createdAt: string;
}

export interface KontaktObjektZuordnung {
  rolle: "MIETER" | "EIGENTUEMER";
  einheit: EinheitRef;
  mietvertragStatus: MietvertragStatus | null;
}

export interface CreateKontaktRequest {
  typ: KontaktTyp;
  vorname?: string;
  nachname?: string;
  firma?: string;
  email?: string;
  telefon?: string;
  debitorNr?: string;
  kreditorNr?: string;
  geburtsdatum?: string;
  adresseStrasse?: string;
  adresseHausnummer?: string;
  adressePlz?: string;
  adresseOrt?: string;
  notizen?: string;
  bankKontoinhaber?: string;
  bankName?: string;
  bankIban?: string;
  bankBic?: string;
  bankGlaeubigerId?: string;
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

export interface Workflow {
  id: string;
  label: string;
  prompt: string;
  createdAt: string;
}

export interface CreateWorkflowRequest {
  label: string;
  prompt: string;
}

export type UpdateWorkflowRequest = Partial<CreateWorkflowRequest>;

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
  einheit: EinheitRef | null;
  kontakt: KontaktRef | null;
  verantwortlicher: UserListItem | null;
  labels: Label[];
}

export interface CreateVorgangRequest {
  titel: string;
  beschreibung?: string;
  status?: VorgangStatus;
  faelligkeit?: string;
  objektId?: string;
  einheitId?: string;
  kontaktId?: string;
  verantwortlicherId?: string;
}

export type UpdateVorgangRequest = Partial<CreateVorgangRequest>;

export interface VorgangVerlaufEintrag {
  id: string;
  text: string;
  createdAt: string;
  autor: { id: string; name: string };
}

export const TODO_ICON_NAMES = [
  "Wrench",
  "Phone",
  "Mail",
  "FileText",
  "CalendarClock",
  "KeyRound",
  "Droplet",
  "Zap",
  "Flame",
  "Trash2",
  "Car",
  "ShieldCheck",
  "Home",
  "UserRound",
  "Package",
  "AlertTriangle",
  "ClipboardList",
  "Hammer",
  "Sparkles",
  "Truck",
  "Lightbulb",
  "PaintRoller",
  "CircleDot",
] as const;

export type TodoIconName = (typeof TODO_ICON_NAMES)[number];

export interface ToDo {
  id: string;
  titel: string;
  icon: TodoIconName | null;
  erledigt: boolean;
  faelligkeit: string | null;
  vorgangId: string;
  createdAt: string;
  labels: Label[];
}

export interface ToDoListItem extends ToDo {
  vorgang: { id: string; titel: string };
}

export interface CreateToDoRequest {
  titel: string;
  faelligkeit?: string;
}

export interface UpdateToDoRequest {
  erledigt?: boolean;
  faelligkeit?: string;
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
  kaution: number | null;
  iban: string | null;
  sepaLastschrift: boolean;
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
  kaution?: number;
  iban?: string;
  sepaLastschrift?: boolean;
  beginn: string;
  ende?: string;
  status?: MietvertragStatus;
}

export type UpdateMietvertragRequest = Partial<CreateMietvertragRequest>;

export enum DokumentKategorie {
  ANSCHAFFUNGSKOSTEN = "ANSCHAFFUNGSKOSTEN",
  BETRIEBS_NEBENKOSTEN = "BETRIEBS_NEBENKOSTEN",
  FINANZIERUNG_KREDITE_VERSICHERUNGEN = "FINANZIERUNG_KREDITE_VERSICHERUNGEN",
  INDIVIDUELLE_KOSTEN = "INDIVIDUELLE_KOSTEN",
  MIETE_NEBENKOSTEN_KAUTION = "MIETE_NEBENKOSTEN_KAUTION",
  RENOVIERUNG_REPARATUR_INVESTITIONEN = "RENOVIERUNG_REPARATUR_INVESTITIONEN",
  SONSTIGE_AUSGABEN = "SONSTIGE_AUSGABEN",
  SONSTIGE_EINNAHMEN = "SONSTIGE_EINNAHMEN",
}

export interface Dokument {
  id: string;
  dateiname: string;
  mimeType: string;
  groesseBytes: number;
  kategorie: DokumentKategorie | null;
  createdAt: string;
  hochgeladenVon: { id: string; name: string };
}

export interface UpdateDokumentRequest {
  kategorie: DokumentKategorie | null;
}

export interface DokumentMitZuordnung extends Dokument {
  zugeordnetZu: string | null;
  zugeordnetTyp: "objekt" | "vorgang" | "mietvertrag" | "nebenkostenabrechnung" | "kontakt" | null;
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
  OEL = "OEL",
}

export interface Zaehler {
  id: string;
  typ: ZaehlerTyp;
  zaehlernummer: string;
  hauptzaehler: boolean;
  versorger: string | null;
  vertragsNr: string | null;
  lage: string | null;
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
  lage?: string;
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

export interface NebenkostenKostenanteil {
  einheit: { id: string; name: string };
  betrag: number;
  positionen: { positionId: string; betrag: number }[];
}

export interface Nebenkostenabrechnung {
  id: string;
  zeitraumVon: string;
  zeitraumBis: string;
  status: NebenkostenStatus;
  createdAt: string;
  objekt: ObjektRef;
  kostenverteilung?: NebenkostenKostenanteil[];
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
