import { Injectable, NotFoundException } from "@nestjs/common";
import { Einheit, EinheitListItem } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEinheitDto } from "./dto/create-einheit.dto";
import { UpdateEinheitDto } from "./dto/update-einheit.dto";

@Injectable()
export class EinheitenService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForMandant(mandantId: string): Promise<EinheitListItem[]> {
    const einheiten = await this.prisma.einheit.findMany({
      where: { objekt: { mandantId } },
      include: { objekt: { select: { id: true, name: true } } },
      orderBy: [{ objekt: { name: "asc" } }, { name: "asc" }],
    });
    return einheiten.map((e) => ({ ...toEinheit(e), objekt: e.objekt }));
  }

  async findAllForObjekt(mandantId: string, objektId: string): Promise<Einheit[]> {
    await this.assertObjektOwnership(mandantId, objektId);
    const einheiten = await this.prisma.einheit.findMany({
      where: { objektId },
      orderBy: { createdAt: "asc" },
    });
    return einheiten.map(toEinheit);
  }

  async create(mandantId: string, objektId: string, dto: CreateEinheitDto): Promise<Einheit> {
    await this.assertObjektOwnership(mandantId, objektId);
    const einheit = await this.prisma.einheit.create({
      data: { ...dto, objektId },
    });
    return toEinheit(einheit);
  }

  async update(mandantId: string, einheitId: string, dto: UpdateEinheitDto): Promise<Einheit> {
    const existing = await this.prisma.einheit.findFirst({
      where: { id: einheitId, objekt: { mandantId } },
    });
    if (!existing) throw new NotFoundException("Einheit nicht gefunden.");
    const einheit = await this.prisma.einheit.update({ where: { id: einheitId }, data: dto });
    return toEinheit(einheit);
  }

  async remove(mandantId: string, einheitId: string): Promise<void> {
    const einheit = await this.prisma.einheit.findFirst({
      where: { id: einheitId, objekt: { mandantId } },
    });
    if (!einheit) throw new NotFoundException("Einheit nicht gefunden.");
    await this.prisma.einheit.delete({ where: { id: einheitId } });
  }

  private async assertObjektOwnership(mandantId: string, objektId: string): Promise<void> {
    const objekt = await this.prisma.objekt.findFirst({ where: { id: objektId, mandantId } });
    if (!objekt) throw new NotFoundException("Objekt nicht gefunden.");
  }
}

function toEinheit(einheit: {
  id: string;
  name: string;
  kategorie: string;
  flaeche: unknown;
  objektId: string;
  createdAt: Date;
}): Einheit {
  return {
    id: einheit.id,
    name: einheit.name,
    kategorie: einheit.kategorie,
    flaeche: einheit.flaeche != null ? Number(einheit.flaeche) : null,
    objektId: einheit.objektId,
    createdAt: einheit.createdAt.toISOString(),
  };
}
