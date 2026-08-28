import { Injectable, NotFoundException } from "@nestjs/common";
import { Eigentuemerschaft } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEigentuemerschaftDto } from "./dto/create-eigentuemerschaft.dto";
import { UpdateEigentuemerschaftDto } from "./dto/update-eigentuemerschaft.dto";

const INCLUDE = {
  einheit: { select: { id: true, name: true, objekt: { select: { id: true, name: true } } } },
  eigentuemer: { select: { id: true, vorname: true, nachname: true, firma: true } },
} as const;

@Injectable()
export class EigentuemerschaftenService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(mandantId: string): Promise<Eigentuemerschaft[]> {
    const eigentuemerschaften = await this.prisma.eigentuemerschaft.findMany({
      where: { einheit: { objekt: { mandantId } } },
      include: INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return eigentuemerschaften.map(toEigentuemerschaft);
  }

  async findOne(mandantId: string, id: string): Promise<Eigentuemerschaft> {
    const eigentuemerschaft = await this.prisma.eigentuemerschaft.findFirst({
      where: { id, einheit: { objekt: { mandantId } } },
      include: INCLUDE,
    });
    if (!eigentuemerschaft) throw new NotFoundException("Eigentümerschaft nicht gefunden.");
    return toEigentuemerschaft(eigentuemerschaft);
  }

  async create(mandantId: string, dto: CreateEigentuemerschaftDto): Promise<Eigentuemerschaft> {
    await this.assertRefsBelongToMandant(mandantId, dto.einheitId, dto.eigentuemerId);
    const eigentuemerschaft = await this.prisma.eigentuemerschaft.create({
      data: {
        einheitId: dto.einheitId,
        eigentuemerId: dto.eigentuemerId,
        hausgeldAnteil: dto.hausgeldAnteil,
        anteilProzent: dto.anteilProzent,
      },
      include: INCLUDE,
    });
    return toEigentuemerschaft(eigentuemerschaft);
  }

  async update(mandantId: string, id: string, dto: UpdateEigentuemerschaftDto): Promise<Eigentuemerschaft> {
    await this.findOne(mandantId, id);
    await this.assertRefsBelongToMandant(mandantId, dto.einheitId, dto.eigentuemerId);
    const eigentuemerschaft = await this.prisma.eigentuemerschaft.update({
      where: { id },
      data: dto,
      include: INCLUDE,
    });
    return toEigentuemerschaft(eigentuemerschaft);
  }

  async remove(mandantId: string, id: string): Promise<void> {
    await this.findOne(mandantId, id);
    await this.prisma.eigentuemerschaft.delete({ where: { id } });
  }

  private async assertRefsBelongToMandant(mandantId: string, einheitId?: string, eigentuemerId?: string) {
    if (einheitId) {
      const einheit = await this.prisma.einheit.findFirst({
        where: { id: einheitId, objekt: { mandantId } },
      });
      if (!einheit) throw new NotFoundException("Einheit nicht gefunden.");
    }
    if (eigentuemerId) {
      const kontakt = await this.prisma.kontakt.findFirst({ where: { id: eigentuemerId, mandantId } });
      if (!kontakt) throw new NotFoundException("Kontakt nicht gefunden.");
    }
  }
}

function toEigentuemerschaft(eigentuemerschaft: {
  id: string;
  hausgeldAnteil: unknown;
  anteilProzent: unknown;
  createdAt: Date;
  einheit: { id: string; name: string; objekt: { id: string; name: string } };
  eigentuemer: { id: string; vorname: string | null; nachname: string | null; firma: string | null };
}): Eigentuemerschaft {
  return {
    id: eigentuemerschaft.id,
    hausgeldAnteil: Number(eigentuemerschaft.hausgeldAnteil),
    anteilProzent: eigentuemerschaft.anteilProzent != null ? Number(eigentuemerschaft.anteilProzent) : null,
    createdAt: eigentuemerschaft.createdAt.toISOString(),
    einheit: eigentuemerschaft.einheit,
    eigentuemer: eigentuemerschaft.eigentuemer,
  };
}
