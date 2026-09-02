import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";
import { TODO_ICON_NAMES, ToDo, ToDoListItem, TodoIconName } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { VerlaufService } from "../vorgaenge/verlauf.service";
import { CreateToDoDto } from "./dto/create-todo.dto";
import { UpdateToDoDto } from "./dto/update-todo.dto";

const MODEL = "gemini-flash-lite-latest";

const INCLUDE = {
  labels: { include: { label: { select: { id: true, name: true, farbe: true } } } },
} as const;

@Injectable()
export class TodosService {
  private readonly ai: GoogleGenAI | null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly verlaufService: VerlaufService,
    config: ConfigService,
  ) {
    const apiKey = config.get<string>("GEMINI_API_KEY");
    this.ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
  }

  async findAllForMandant(mandantId: string): Promise<ToDoListItem[]> {
    const todos = await this.prisma.toDo.findMany({
      where: { vorgang: { mandantId } },
      include: { ...INCLUDE, vorgang: { select: { id: true, titel: true } } },
      orderBy: { createdAt: "desc" },
    });
    return todos.map((t) => ({ ...toToDo(t), vorgang: t.vorgang }));
  }

  async findAllForVorgang(mandantId: string, vorgangId: string): Promise<ToDo[]> {
    await this.assertVorgangOwnership(mandantId, vorgangId);
    const todos = await this.prisma.toDo.findMany({
      where: { vorgangId },
      include: INCLUDE,
      orderBy: [{ reihenfolge: "asc" }, { createdAt: "asc" }],
    });
    return todos.map(toToDo);
  }

  async create(mandantId: string, vorgangId: string, dto: CreateToDoDto): Promise<ToDo> {
    await this.assertVorgangOwnership(mandantId, vorgangId);
    const icon = await this.suggestIcon(dto.titel);
    const todo = await this.prisma.toDo.create({
      data: {
        titel: dto.titel,
        faelligkeit: dto.faelligkeit ? new Date(dto.faelligkeit) : undefined,
        icon,
        vorgangId,
      },
      include: INCLUDE,
    });
    return toToDo(todo);
  }

  async update(mandantId: string, userId: string, id: string, dto: UpdateToDoDto): Promise<ToDo> {
    const existing = await this.prisma.toDo.findFirst({
      where: { id, vorgang: { mandantId } },
    });
    if (!existing) throw new NotFoundException("ToDo nicht gefunden.");
    const todo = await this.prisma.toDo.update({
      where: { id },
      data: {
        erledigt: dto.erledigt,
        faelligkeit: dto.faelligkeit ? new Date(dto.faelligkeit) : undefined,
      },
      include: INCLUDE,
    });

    if (dto.erledigt !== undefined && dto.erledigt !== existing.erledigt) {
      const text = dto.erledigt ? `ToDo „${todo.titel}“ erledigt` : `ToDo „${todo.titel}“ wieder geöffnet`;
      await this.verlaufService.log(existing.vorgangId, userId, text);
    }

    if (dto.faelligkeit !== undefined && existing.faelligkeit?.toISOString() !== todo.faelligkeit?.toISOString()) {
      await this.verlaufService.log(
        existing.vorgangId,
        userId,
        `ToDo „${todo.titel}“ Fälligkeit gesetzt auf ${new Date(dto.faelligkeit).toLocaleDateString("de-DE")}`,
      );
    }

    return toToDo(todo);
  }

  async remove(mandantId: string, id: string): Promise<void> {
    const existing = await this.prisma.toDo.findFirst({
      where: { id, vorgang: { mandantId } },
    });
    if (!existing) throw new NotFoundException("ToDo nicht gefunden.");
    await this.prisma.toDo.delete({ where: { id } });
  }

  private async suggestIcon(titel: string): Promise<TodoIconName | null> {
    if (!this.ai) return null;
    try {
      const response = await this.ai.models.generateContent({
        model: MODEL,
        contents: [{ role: "user", parts: [{ text: titel }] }],
        config: {
          systemInstruction: `Du ordnest ToDo-Titeln aus einer Hausverwaltungs-App genau ein passendes Icon zu. Antworte NUR mit einem der folgenden Namen, ohne weiteren Text: ${TODO_ICON_NAMES.join(", ")}. Wenn nichts eindeutig passt, antworte mit "CircleDot".`,
        },
      });
      const raw = (response.text ?? "").trim();
      return (TODO_ICON_NAMES as readonly string[]).includes(raw) ? (raw as TodoIconName) : null;
    } catch {
      return null;
    }
  }

  private async assertVorgangOwnership(mandantId: string, vorgangId: string): Promise<void> {
    const vorgang = await this.prisma.vorgang.findFirst({ where: { id: vorgangId, mandantId } });
    if (!vorgang) throw new NotFoundException("Vorgang nicht gefunden.");
  }
}

function toToDo(todo: {
  id: string;
  titel: string;
  icon: string | null;
  erledigt: boolean;
  faelligkeit: Date | null;
  vorgangId: string;
  createdAt: Date;
  labels: { label: { id: string; name: string; farbe: string } }[];
}): ToDo {
  return {
    id: todo.id,
    titel: todo.titel,
    icon: (TODO_ICON_NAMES as readonly string[]).includes(todo.icon ?? "") ? (todo.icon as TodoIconName) : null,
    erledigt: todo.erledigt,
    faelligkeit: todo.faelligkeit ? todo.faelligkeit.toISOString() : null,
    vorgangId: todo.vorgangId,
    createdAt: todo.createdAt.toISOString(),
    labels: todo.labels.map((l) => l.label),
  };
}
