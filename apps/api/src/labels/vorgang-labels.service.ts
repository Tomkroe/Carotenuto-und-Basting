import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { VerlaufService } from "../vorgaenge/verlauf.service";

@Injectable()
export class VorgangLabelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly verlaufService: VerlaufService,
  ) {}

  async attach(mandantId: string, userId: string, vorgangId: string, labelId: string): Promise<void> {
    const label = await this.assertOwnership(mandantId, vorgangId, labelId);
    await this.prisma.vorgangLabel.upsert({
      where: { vorgangId_labelId: { vorgangId, labelId } },
      create: { vorgangId, labelId },
      update: {},
    });
    await this.verlaufService.log(vorgangId, userId, `Label „${label.name}“ hinzugefügt`);
  }

  async detach(mandantId: string, userId: string, vorgangId: string, labelId: string): Promise<void> {
    const label = await this.assertOwnership(mandantId, vorgangId, labelId);
    await this.prisma.vorgangLabel.deleteMany({ where: { vorgangId, labelId } });
    await this.verlaufService.log(vorgangId, userId, `Label „${label.name}“ entfernt`);
  }

  private async assertOwnership(mandantId: string, vorgangId: string, labelId: string) {
    const vorgang = await this.prisma.vorgang.findFirst({ where: { id: vorgangId, mandantId } });
    if (!vorgang) throw new NotFoundException("Vorgang nicht gefunden.");
    const label = await this.prisma.label.findFirst({ where: { id: labelId, mandantId } });
    if (!label) throw new NotFoundException("Label nicht gefunden.");
    return label;
  }
}
