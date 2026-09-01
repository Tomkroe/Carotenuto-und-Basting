export const DEFAULT_WORKFLOWS = [
  { label: "Vorgang anlegen", prompt: "Leg einen Vorgang an: " },
  { label: "Status ändern", prompt: "Setze den Status von Vorgang #" },
  { label: "Kommentar hinzufügen", prompt: "Füge Vorgang # den Kommentar hinzu: " },
  { label: "Mietvertrag anlegen", prompt: "Leg einen Mietvertrag an für " },
  { label: "Dokument anhängen", prompt: "Häng die angehängte Datei an " },
  { label: "E-Mail entwerfen", prompt: "Entwirf eine E-Mail an " },
] as const;
