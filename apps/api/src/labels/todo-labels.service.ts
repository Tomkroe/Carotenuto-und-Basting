import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TodoLabelsService {
  constructor(private readonly prisma: PrismaService) {}

  async attach(mandantId: string, todoId: string, labelId: string): Promise<void> {
    await this.assertOwnership(mandantId, todoId, labelId);
    await this.prisma.toDoLabel.upsert({
      where: { todoId_labelId: { todoId, labelId } },
      create: { todoId, labelId },
      update: {},
    });
  }

  async detach(mandantId: string, todoId: string, labelId: string): Promise<void> {
    await this.assertOwnership(mandantId, todoId, labelId);
    await this.prisma.toDoLabel.deleteMany({ where: { todoId, labelId } });
  }

  private async assertOwnership(mandantId: string, todoId: string, labelId: string): Promise<void> {
    const todo = await this.prisma.toDo.findFirst({ where: { id: todoId, vorgang: { mandantId } } });
    if (!todo) throw new NotFoundException("ToDo nicht gefunden.");
    const label = await this.prisma.label.findFirst({ where: { id: labelId, mandantId } });
    if (!label) throw new NotFoundException("Label nicht gefunden.");
  }
}
