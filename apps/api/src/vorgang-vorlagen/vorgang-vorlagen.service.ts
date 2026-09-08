import { Injectable, NotFoundException } from "@nestjs/common";
import { Label, VorgangVorlage } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVorgangVorlageDto } from "./dto/create-vorgang-vorlage.dto";
import { UpdateVorgangVorlageDto } from "./dto/update-vorgang-vorlage.dto";

const INCLUDE = { labels: { include: { label: true } } } as const;

@Injectable()
export class VorgangVorlagenService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(mandantId: string): Promise<VorgangVorlage[]> {
    const vorlagen = await this.prisma.vorgangVorlage.findMany({
      where: { mandantId },
      include: INCLUDE,
      orderBy: { titel: "asc" },
    });
    return vorlagen.map(toVorlage);
  }

  async create(mandantId: string, dto: CreateVorgangVorlageDto): Promise<VorgangVorlage> {
    await this.assertLabelsBelongToMandant(mandantId, dto.labelIds);
    const vorlage = await this.prisma.vorgangVorlage.create({
      data: {
        titel: dto.titel,
        beschreibung: dto.beschreibung,
        mandantId,
        labels: dto.labelIds ? { create: dto.labelIds.map((labelId) => ({ labelId })) } : undefined,
      },
      include: INCLUDE,
    });
    return toVorlage(vorlage);
  }

  async update(mandantId: string, id: string, dto: UpdateVorgangVorlageDto): Promise<VorgangVorlage> {
    const existing = await this.prisma.vorgangVorlage.findFirst({ where: { id, mandantId } });
    if (!existing) throw new NotFoundException("Vorlage nicht gefunden.");
    await this.assertLabelsBelongToMandant(mandantId, dto.labelIds);

    if (dto.labelIds) {
      await this.prisma.vorlageLabel.deleteMany({ where: { vorlageId: id } });
    }
    const vorlage = await this.prisma.vorgangVorlage.update({
      where: { id },
      data: {
        titel: dto.titel,
        beschreibung: dto.beschreibung,
        labels: dto.labelIds ? { create: dto.labelIds.map((labelId) => ({ labelId })) } : undefined,
      },
      include: INCLUDE,
    });
    return toVorlage(vorlage);
  }

  async remove(mandantId: string, id: string): Promise<void> {
    const existing = await this.prisma.vorgangVorlage.findFirst({ where: { id, mandantId } });
    if (!existing) throw new NotFoundException("Vorlage nicht gefunden.");
    await this.prisma.vorgangVorlage.delete({ where: { id } });
  }

  private async assertLabelsBelongToMandant(mandantId: string, labelIds?: string[]): Promise<void> {
    if (!labelIds || labelIds.length === 0) return;
    const count = await this.prisma.label.count({ where: { id: { in: labelIds }, mandantId } });
    if (count !== labelIds.length) throw new NotFoundException("Label nicht gefunden.");
  }
}

function toVorlage(vorlage: {
  id: string;
  titel: string;
  beschreibung: string | null;
  createdAt: Date;
  labels: { label: Label }[];
}): VorgangVorlage {
  return {
    id: vorlage.id,
    titel: vorlage.titel,
    beschreibung: vorlage.beschreibung,
    labels: vorlage.labels.map((l) => l.label),
    createdAt: vorlage.createdAt.toISOString(),
  };
}
