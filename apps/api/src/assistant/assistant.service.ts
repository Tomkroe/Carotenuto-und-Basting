import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Content, FunctionCall, FunctionDeclaration, GoogleGenAI, Type } from "@google/genai";
import { AssistantAction, AssistantChatMessage, VorgangStatus } from "@maklerprogram/types";
import { VorgaengeService } from "../vorgaenge/vorgaenge.service";
import { ObjekteService } from "../objekte/objekte.service";
import { KontakteService } from "../kontakte/kontakte.service";
import { KommentareService } from "../kommentare/kommentare.service";

const MODEL = "gemini-3.6-flash";
const MAX_TOOL_ROUNDS = 5;

const TOOLS: FunctionDeclaration[] = [
  {
    name: "list_objekte",
    description: "Listet alle Objekte (Häuser/WEGs) des Nutzers mit ID, Name und Adresse. Zum Auflösen von Objektnamen zu IDs.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: "list_kontakte",
    description: "Listet alle Kontakte (Mieter, Eigentümer, Dienstleister, ...) mit ID, Name und Typ. Zum Auflösen von Personennamen zu IDs.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: "list_vorgaenge",
    description: "Listet die letzten Vorgänge (Aufgaben/Tickets) mit ID, Nummer, Titel und Status.",
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
];

@Injectable()
export class AssistantService {
  private readonly ai: GoogleGenAI | null;

  constructor(
    private readonly config: ConfigService,
    private readonly vorgaengeService: VorgaengeService,
    private readonly objekteService: ObjekteService,
    private readonly kontakteService: KontakteService,
    private readonly kommentareService: KommentareService,
  ) {
    const apiKey = this.config.get<string>("GEMINI_API_KEY");
    this.ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
  }

  async chat(
    mandantId: string,
    autorId: string,
    messages: AssistantChatMessage[],
  ): Promise<{ reply: string; actions: AssistantAction[] }> {
    if (!this.ai) {
      throw new InternalServerErrorException(
        "KI-Assistent ist nicht konfiguriert (GEMINI_API_KEY fehlt).",
      );
    }

    const contents: Content[] = messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] }));
    const actions: AssistantAction[] = [];
    const today = new Date().toISOString().slice(0, 10);

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await this.ai.models.generateContent({
        model: MODEL,
        contents,
        config: {
          systemInstruction: `Du bist der KI-Assistent einer Hausverwaltungs-Software. Heutiges Datum: ${today}. Hilf dem Nutzer, Vorgänge (Aufgaben/Tickets) zu verwalten. Nutze die verfügbaren Werkzeuge, um Namen zu Objekt-/Kontakt-IDs aufzulösen, bevor du einen Vorgang anlegst. Wenn ein Name mehrdeutig ist oder nicht gefunden wird, frag nach statt zu raten. Antworte kurz, auf Deutsch, und ohne Markdown-Formatierung (kein **fett**, keine Listen mit "-") — die Antwort wird als reiner Text angezeigt.`,
          tools: [{ functionDeclarations: TOOLS }],
        },
      });

      const functionCalls = response.functionCalls;
      if (!functionCalls || functionCalls.length === 0) {
        return { reply: response.text ?? "", actions };
      }

      const modelContent = response.candidates?.[0]?.content;
      contents.push(modelContent ?? { role: "model", parts: functionCalls.map((call) => ({ functionCall: call })) });

      const responseParts = await Promise.all(
        functionCalls.map(async (call) => {
          const { result, action } = await this.executeTool(mandantId, autorId, call);
          if (action) actions.push(action);
          return { functionResponse: { name: call.name, response: result } };
        }),
      );
      contents.push({ role: "user", parts: responseParts });
    }

    return {
      reply: "Ich konnte die Anfrage nicht in angemessener Zeit abschließen. Bitte versuche es erneut.",
      actions,
    };
  }

  private async executeTool(
    mandantId: string,
    autorId: string,
    call: FunctionCall,
  ): Promise<{ result: Record<string, unknown>; action: AssistantAction | null }> {
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
        case "list_kontakte": {
          const kontakte = await this.kontakteService.findAll(mandantId);
          return {
            result: {
              kontakte: kontakte.map((k) => ({
                id: k.id,
                name: [k.vorname, k.nachname].filter(Boolean).join(" ") || k.firma || "Unbenannt",
                typ: k.typ,
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
        default:
          return { result: { error: `Unbekanntes Werkzeug: ${call.name}` }, action: null };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler";
      return { result: { error: message }, action: null };
    }
  }
}
