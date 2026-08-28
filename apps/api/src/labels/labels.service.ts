import { Injectable, NotFoundException } from "@nestjs/common";
import { Label } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLabelDto } from "./dto/create-label.dto";

@Injectable()
export class LabelsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(mandantId: string): Promise<Label[]> {
    const labels = await this.prisma.label.findMany({
      where: { mandantId },
      orderBy: { name: "asc" },
    });
    return labels;
  }

  async create(mandantId: string, dto: CreateLabelDto): Promise<Label> {
    const label = await this.prisma.label.create({ data: { ...dto, mandantId } });
    return label;
  }

  async remove(mandantId: string, id: string): Promise<void> {
    const existing = await this.prisma.label.findFirst({ where: { id, mandantId } });
    if (!existing) throw new NotFoundException("Label nicht gefunden.");
    await this.prisma.label.delete({ where: { id } });
  }
}
