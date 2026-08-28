import { Injectable, NotFoundException } from "@nestjs/common";
import { ToDo } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { CreateToDoDto } from "./dto/create-todo.dto";
import { UpdateToDoDto } from "./dto/update-todo.dto";

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForVorgang(mandantId: string, vorgangId: string): Promise<ToDo[]> {
    await this.assertVorgangOwnership(mandantId, vorgangId);
    const todos = await this.prisma.toDo.findMany({
      where: { vorgangId },
      orderBy: [{ reihenfolge: "asc" }, { createdAt: "asc" }],
    });
    return todos.map(toToDo);
  }

  async create(mandantId: string, vorgangId: string, dto: CreateToDoDto): Promise<ToDo> {
    await this.assertVorgangOwnership(mandantId, vorgangId);
    const todo = await this.prisma.toDo.create({ data: { ...dto, vorgangId } });
    return toToDo(todo);
  }

  async update(mandantId: string, id: string, dto: UpdateToDoDto): Promise<ToDo> {
    const existing = await this.prisma.toDo.findFirst({
      where: { id, vorgang: { mandantId } },
    });
    if (!existing) throw new NotFoundException("ToDo nicht gefunden.");
    const todo = await this.prisma.toDo.update({ where: { id }, data: dto });
    return toToDo(todo);
  }

  async remove(mandantId: string, id: string): Promise<void> {
    const existing = await this.prisma.toDo.findFirst({
      where: { id, vorgang: { mandantId } },
    });
    if (!existing) throw new NotFoundException("ToDo nicht gefunden.");
    await this.prisma.toDo.delete({ where: { id } });
  }

  private async assertVorgangOwnership(mandantId: string, vorgangId: string): Promise<void> {
    const vorgang = await this.prisma.vorgang.findFirst({ where: { id: vorgangId, mandantId } });
    if (!vorgang) throw new NotFoundException("Vorgang nicht gefunden.");
  }
}

function toToDo(todo: {
  id: string;
  titel: string;
  erledigt: boolean;
  vorgangId: string;
  createdAt: Date;
}): ToDo {
  return {
    id: todo.id,
    titel: todo.titel,
    erledigt: todo.erledigt,
    vorgangId: todo.vorgangId,
    createdAt: todo.createdAt.toISOString(),
  };
}
