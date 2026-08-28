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

export interface VorgangObjektRef {
  id: string;
  name: string;
}

export interface VorgangKontaktRef {
  id: string;
  vorname: string | null;
  nachname: string | null;
  firma: string | null;
}

export interface Vorgang {
  id: string;
  nummer: number;
  titel: string;
  beschreibung: string | null;
  status: VorgangStatus;
  faelligkeit: string | null;
  createdAt: string;
  objekt: VorgangObjektRef | null;
  kontakt: VorgangKontaktRef | null;
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
  vorgangId: string;
  createdAt: string;
  autor: { id: string; name: string };
}

export interface CreateKommentarRequest {
  text: string;
}
