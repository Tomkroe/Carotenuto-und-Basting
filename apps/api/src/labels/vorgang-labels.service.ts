import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class VorgangLabelsService {
  constructor(private readonly prisma: PrismaService) {}

  async attach(mandantId: string, vorgangId: string, labelId: string): Promise<void> {
    await this.assertOwnership(mandantId, vorgangId, labelId);
    await this.prisma.vorgangLabel.upsert({
      where: { vorgangId_labelId: { vorgangId, labelId } },
      create: { vorgangId, labelId },
      update: {},
    });
  }

  async detach(mandantId: string, vorgangId: string, labelId: string): Promise<void> {
    await this.assertOwnership(mandantId, vorgangId, labelId);
    await this.prisma.vorgangLabel.deleteMany({ where: { vorgangId, labelId } });
  }

  private async assertOwnership(mandantId: string, vorgangId: string, labelId: string): Promise<void> {
    const vorgang = await this.prisma.vorgang.findFirst({ where: { id: vorgangId, mandantId } });
    if (!vorgang) throw new NotFoundException("Vorgang nicht gefunden.");
    const label = await this.prisma.label.findFirst({ where: { id: labelId, mandantId } });
    if (!label) throw new NotFoundException("Label nicht gefunden.");
  }
}
