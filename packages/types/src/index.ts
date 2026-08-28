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
