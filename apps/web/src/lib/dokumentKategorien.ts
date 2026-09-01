import { DokumentKategorie } from "@maklerprogram/types";

export const DOKUMENT_KATEGORIE_LABEL: Record<DokumentKategorie, string> = {
  [DokumentKategorie.ANSCHAFFUNGSKOSTEN]: "Anschaffungskosten",
  [DokumentKategorie.BETRIEBS_NEBENKOSTEN]: "Betriebs-/Nebenkosten",
  [DokumentKategorie.FINANZIERUNG_KREDITE_VERSICHERUNGEN]: "Finanzierung, Kredite & Versicherungen",
  [DokumentKategorie.INDIVIDUELLE_KOSTEN]: "Individuelle Kosten",
  [DokumentKategorie.MIETE_NEBENKOSTEN_KAUTION]: "Miete, Nebenkosten & Kaution",
  [DokumentKategorie.RENOVIERUNG_REPARATUR_INVESTITIONEN]: "Renovierung/Reparatur & Investitionen",
  [DokumentKategorie.SONSTIGE_AUSGABEN]: "Sonstige Ausgaben",
  [DokumentKategorie.SONSTIGE_EINNAHMEN]: "Sonstige Einnahmen",
};
