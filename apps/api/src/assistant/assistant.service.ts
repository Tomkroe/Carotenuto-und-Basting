import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Content, FunctionCall, FunctionDeclaration, GoogleGenAI, Type } from "@google/genai";
import {
  AssistantAction,
  AssistantAttachment,
  AssistantChatMessage,
  AssistantEmailDraft,
  VorgangStatus,
} from "@maklerprogram/types";
import { VorgaengeService } from "../vorgaenge/vorgaenge.service";
import { ObjekteService } from "../objekte/objekte.service";
import { EinheitenService } from "../einheiten/einheiten.service";
import { KontakteService } from "../kontakte/kontakte.service";
import { KommentareService } from "../kommentare/kommentare.service";
import { MietvertraegeService } from "../mietvertraege/mietvertraege.service";
import { DokumenteService } from "../dokumente/dokumente.service";

const MODEL = "gemini-flash-lite-latest";
const MAX_TOOL_ROUNDS = 5;

const ALLOWED_DOKUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_DOKUMENT_SIZE = 25 * 1024 * 1024;

const ZIEL_TYPEN = ["objekt", "vorgang", "mietvertrag", "kontakt"] as const;
type ZielTyp = (typeof ZIEL_TYPEN)[number];

const TOOLS: FunctionDeclaration[] = [
  {
    name: "list_objekte",
    description: "Listet alle Objekte (Häuser/WEGs) des Nutzers mit ID, Name und Adresse. Zum Auflösen von Objektnamen zu IDs.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: "list_einheiten",
    description: "Listet alle Einheiten (Wohnungen/Gewerbe/Stellplätze) mit ID, Name, Kategorie und zugehörigem Objekt. Zum Auflösen für Mietverträge.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: "list_kontakte",
    description: "Listet alle Kontakte (Mieter, Eigentümer, Dienstleister, ...) mit ID, Name, Typ und E-Mail. Zum Auflösen von Personennamen zu IDs bzw. E-Mail-Adressen.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: "list_vorgaenge",
    description: "Listet die letzten Vorgänge (Aufgaben/Tickets) mit ID, Nummer, Titel und Status.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: "list_mietvertraege",
    description: "Listet alle Mietverträge mit ID, Objekt, Einheit, Mieter und Status. Zum Auflösen, wenn sich der Nutzer auf einen bestehenden Mietvertrag bezieht.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: "create_vorgang",
    description: "Legt einen neuen Vorgang (Aufgabe/Ticket) an, z.B. für eine Reparatur oder ein ToDo.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        titel: { type: Type.STRING, description: "Kurzer Titel des Vorgangs." },
        beschreibung: { type: Type.STRING, description: "Optionale, ausführlichere Beschreibung." },
        objektId: { type: Type.STRING, description: "ID des betroffenen Objekts, falls bekannt (via list_objekte ermitteln)." },
        kontaktId: { type: Type.STRING, description: "ID des betroffenen Kontakts, falls bekannt (via list_kontakte ermitteln)." },
        faelligkeit: { type: Type.STRING, description: "Fälligkeitsdatum im Format YYYY-MM-DD, falls genannt." },
      },
      required: ["titel"],
    },
  },
  {
    name: "update_vorgang_status",
    description: "Ändert den Status eines bestehenden Vorgangs.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        vorgangId: { type: Type.STRING, description: "ID des Vorgangs (via list_vorgaenge ermitteln)." },
        status: { type: Type.STRING, enum: Object.values(VorgangStatus), description: "Neuer Status." },
      },
      required: ["vorgangId", "status"],
    },
  },
  {
    name: "add_kommentar_zu_vorgang",
    description: "Fügt einem bestehenden Vorgang einen Kommentar/eine Notiz hinzu.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        vorgangId: { type: Type.STRING, description: "ID des Vorgangs (via list_vorgaenge ermitteln)." },
        text: { type: Type.STRING, description: "Text des Kommentars." },
      },
      required: ["vorgangId", "text"],
    },
  },
  {
    name: "create_mietvertrag",
    description: "Legt einen neuen Mietvertrag zwischen einer Einheit und einem Mieter (Kontakt) an.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        einheitId: { type: Type.STRING, description: "ID der Einheit (via list_einheiten ermitteln)." },
        kontaktId: { type: Type.STRING, description: "ID des Mieters (via list_kontakte ermitteln)." },
        kaltmiete: { type: Type.NUMBER, description: "Kaltmiete in Euro." },
        nebenkostenVorauszahlung: { type: Type.NUMBER, description: "Nebenkostenvorauszahlung in Euro, falls genannt." },
        beginn: { type: Type.STRING, description: "Mietbeginn im Format YYYY-MM-DD." },
        ende: { type: Type.STRING, description: "Mietende im Format YYYY-MM-DD, falls befristet." },
      },
      required: ["einheitId", "kontaktId", "kaltmiete", "beginn"],
    },
  },
  {
    name: "create_dokument",
    description: "Hängt die vom Nutzer im Chat angehängte Datei an ein Objekt, einen Vorgang, einen Mietvertrag oder einen Kontakt an. Nur aufrufen, wenn der Nutzer tatsächlich eine Datei angehängt hat.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        zielTyp: { type: Type.STRING, enum: [...ZIEL_TYPEN], description: "Art des Ziels." },
        zielId: { type: Type.STRING, description: "ID des Ziels (via list_objekte/list_vorgaenge/list_kontakte/list_mietvertraege ermitteln)." },
      },
      required: ["zielTyp", "zielId"],
    },
  },
  {
    name: "draft_email",
    description: "Erstellt einen E-Mail-Entwurf, den der Nutzer selbst manuell versenden kann. Sendet keine echte E-Mail.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        an: { type: Type.STRING, description: "Empfänger-E-Mail-Adresse oder -Name (via list_kontakte auflösen, falls möglich)." },
        betreff: { type: Type.STRING, description: "Betreffzeile." },
        text: { type: Type.STRING, description: "Fließtext der E-Mail, ohne Markdown-Formatierung." },
      },
      required: ["an", "betreff", "text"],
    },
  },
];

@Injectable()
export class AssistantService {
  private readonly ai: GoogleGenAI | null;

  constructor(
    private readonly config: ConfigService,
    private readonly vorgaengeService: VorgaengeService,
    private readonly objekteService: ObjekteService,
    private readonly einheitenService: EinheitenService,
    private readonly kontakteService: KontakteService,
    private readonly kommentareService: KommentareService,
    private readonly mietvertraegeService: MietvertraegeService,
    private readonly dokumenteService: DokumenteService,
  ) {
    const apiKey = this.config.get<string>("GEMINI_API_KEY");
    this.ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
  }

  async chat(
    mandantId: string,
    autorId: string,
    messages: AssistantChatMessage[],
    attachment?: AssistantAttachment,
  ): Promise<{ reply: string; actions: AssistantAction[]; emailDraft: AssistantEmailDraft | null }> {
    if (!this.ai) {
      throw new InternalServerErrorException(
        "KI-Assistent ist nicht konfiguriert (GEMINI_API_KEY fehlt).",
      );
    }

    const contents: Content[] = messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] }));
    const actions: AssistantAction[] = [];
    let emailDraft: AssistantEmailDraft | null = null;
    const today = new Date().toISOString().slice(0, 10);
    const attachmentNote = attachment
      ? `Der Nutzer hat die Datei "${attachment.filename}" (${attachment.mimeType}) an diese Nachricht angehängt. Wenn er möchte, dass sie gespeichert wird, rufe create_dokument mit dem passenden Ziel auf.`
      : "Der Nutzer hat keine Datei angehängt.";

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await this.ai.models.generateContent({
        model: MODEL,
        contents,
        config: {
          systemInstruction: `Du bist der KI-Assistent einer Hausverwaltungs-Software. Heutiges Datum: ${today}. Hilf dem Nutzer, Vorgänge, Mietverträge und Dokumente zu verwalten und E-Mails zu entwerfen. Nutze die verfügbaren Werkzeuge, um Namen zu Objekt-/Einheit-/Kontakt-IDs aufzulösen, bevor du etwas anlegst. Wenn ein Name mehrdeutig ist oder nicht gefunden wird, frag nach statt zu raten. ${attachmentNote} Antworte kurz, auf Deutsch, und ohne Markdown-Formatierung (kein **fett**, keine Listen mit "-") — die Antwort wird als reiner Text angezeigt.`,
          tools: [{ functionDeclarations: TOOLS }],
        },
      });

      const functionCalls = response.functionCalls;
      if (!functionCalls || functionCalls.length === 0) {
        return { reply: response.text ?? "", actions, emailDraft };
      }

      const modelContent = response.candidates?.[0]?.content;
      contents.push(modelContent ?? { role: "model", parts: functionCalls.map((call) => ({ functionCall: call })) });

      const responseParts = await Promise.all(
        functionCalls.map(async (call) => {
          const { result, action, draft } = await this.executeTool(mandantId, autorId, call, attachment);
          if (action) actions.push(action);
          if (draft) emailDraft = draft;
          return { functionResponse: { name: call.name, response: result } };
        }),
      );
      contents.push({ role: "user", parts: responseParts });
    }

    return {
      reply: "Ich konnte die Anfrage nicht in angemessener Zeit abschließen. Bitte versuche es erneut.",
      actions,
      emailDraft,
    };
  }

  private async executeTool(
    mandantId: string,
    autorId: string,
    call: FunctionCall,
    attachment: AssistantAttachment | undefined,
  ): Promise<{ result: Record<string, unknown>; action: AssistantAction | null; draft?: AssistantEmailDraft }> {
    try {
      switch (call.name) {
        case "list_objekte": {
          const objekte = await this.objekteService.findAll(mandantId);
          return {
            result: {
              objekte: objekte.map((o) => ({ id: o.id, name: o.name, adresse: `${o.strasse} ${o.hausnummer}, ${o.ort}` })),
            },
            action: null,
          };
        }
        case "list_einheiten": {
          const einheiten = await this.einheitenService.findAllForMandant(mandantId);
          return {
            result: {
              einheiten: einheiten.map((e) => ({ id: e.id, name: e.name, kategorie: e.kategorie, objekt: e.objekt.name })),
            },
            action: null,
          };
        }
        case "list_kontakte": {
          const kontakte = await this.kontakteService.findAll(mandantId);
          return {
            result: {
              kontakte: kontakte.map((k) => ({
                id: k.id,
                name: [k.vorname, k.nachname].filter(Boolean).join(" ") || k.firma || "Unbenannt",
                typ: k.typ,
                email: k.email,
              })),
            },
            action: null,
          };
        }
        case "list_vorgaenge": {
          const vorgaenge = await this.vorgaengeService.findAll(mandantId);
          return {
            result: {
              vorgaenge: vorgaenge
                .slice(0, 30)
                .map((v) => ({ id: v.id, nummer: v.nummer, titel: v.titel, status: v.status })),
            },
            action: null,
          };
        }
        case "list_mietvertraege": {
          const mietvertraege = await this.mietvertraegeService.findAll(mandantId);
          return {
            result: {
              mietvertraege: mietvertraege.map((m) => ({
                id: m.id,
                objekt: m.einheit.objekt.name,
                einheit: m.einheit.name,
                mieter: [m.mieter.vorname, m.mieter.nachname].filter(Boolean).join(" ") || m.mieter.firma || "Unbenannt",
                status: m.status,
              })),
            },
            action: null,
          };
        }
        case "create_vorgang": {
          const args = (call.args ?? {}) as {
            titel: string;
            beschreibung?: string;
            objektId?: string;
            kontaktId?: string;
            faelligkeit?: string;
          };
          const vorgang = await this.vorgaengeService.create(mandantId, args);
          return {
            result: { id: vorgang.id, nummer: vorgang.nummer, titel: vorgang.titel },
            action: { label: `Vorgang #${vorgang.nummer} „${vorgang.titel}" angelegt` },
          };
        }
        case "update_vorgang_status": {
          const args = (call.args ?? {}) as { vorgangId: string; status: VorgangStatus };
          const vorgang = await this.vorgaengeService.update(mandantId, args.vorgangId, { status: args.status });
          return {
            result: { id: vorgang.id, nummer: vorgang.nummer, status: vorgang.status },
            action: { label: `Vorgang #${vorgang.nummer} auf „${vorgang.status}" gesetzt` },
          };
        }
        case "add_kommentar_zu_vorgang": {
          const args = (call.args ?? {}) as { vorgangId: string; text: string };
          await this.kommentareService.createForVorgang(mandantId, args.vorgangId, autorId, { text: args.text });
          return {
            result: { ok: true },
            action: { label: `Kommentar zu Vorgang hinzugefügt` },
          };
        }
        case "create_mietvertrag": {
          const args = (call.args ?? {}) as {
            einheitId: string;
            kontaktId: string;
            kaltmiete: number;
            nebenkostenVorauszahlung?: number;
            beginn: string;
            ende?: string;
          };
          const mietvertrag = await this.mietvertraegeService.create(mandantId, {
            einheitId: args.einheitId,
            mieterId: args.kontaktId,
            kaltmiete: args.kaltmiete,
            nebenkostenVorauszahlung: args.nebenkostenVorauszahlung,
            beginn: args.beginn,
            ende: args.ende,
          });
          return {
            result: { id: mietvertrag.id, einheit: mietvertrag.einheit.name, status: mietvertrag.status },
            action: {
              label: `Mietvertrag für ${mietvertrag.einheit.objekt.name} · ${mietvertrag.einheit.name} angelegt`,
            },
          };
        }
        case "create_dokument": {
          if (!attachment) {
            return { result: { error: "Keine Datei angehängt." }, action: null };
          }
          const args = (call.args ?? {}) as { zielTyp: ZielTyp; zielId: string };
          if (!ZIEL_TYPEN.includes(args.zielTyp)) {
            return { result: { error: `Ungültiger Zieltyp: ${args.zielTyp}` }, action: null };
          }
          if (!ALLOWED_DOKUMENT_MIME_TYPES.has(attachment.mimeType)) {
            return { result: { error: `Dateityp nicht erlaubt: ${attachment.mimeType}` }, action: null };
          }
          const buffer = Buffer.from(attachment.dataBase64, "base64");
          if (buffer.byteLength > MAX_DOKUMENT_SIZE) {
            return { result: { error: "Datei zu groß (max. 25 MB)." }, action: null };
          }
          const file = {
            buffer,
            originalname: attachment.filename,
            mimetype: attachment.mimeType,
            size: buffer.byteLength,
          } as Express.Multer.File;

          const dokument = await this.uploadDokument(mandantId, autorId, args.zielTyp, args.zielId, file);
          return {
            result: { id: dokument.id, dateiname: dokument.dateiname },
            action: { label: `Dokument „${dokument.dateiname}" angehängt` },
          };
        }
        case "draft_email": {
          const args = (call.args ?? {}) as { an: string; betreff: string; text: string };
          return {
            result: { ok: true },
            action: null,
            draft: args,
          };
        }
        default:
          return { result: { error: `Unbekanntes Werkzeug: ${call.name}` }, action: null };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler";
      return { result: { error: message }, action: null };
    }
  }

  private uploadDokument(
    mandantId: string,
    autorId: string,
    zielTyp: ZielTyp,
    zielId: string,
    file: Express.Multer.File,
  ) {
    switch (zielTyp) {
      case "objekt":
        return this.dokumenteService.uploadForObjekt(mandantId, zielId, autorId, file);
      case "vorgang":
        return this.dokumenteService.uploadForVorgang(mandantId, zielId, autorId, file);
      case "mietvertrag":
        return this.dokumenteService.uploadForMietvertrag(mandantId, zielId, autorId, file);
      case "kontakt":
        return this.dokumenteService.uploadForKontakt(mandantId, zielId, autorId, file);
    }
  }
}
