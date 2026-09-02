import { Injectable, NotFoundException } from "@nestjs/common";
import { Nebenkostenabrechnung, NebenkostenKostenanteil, NebenkostenStatus } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { CreateNebenkostenabrechnungDto } from "./dto/create-nebenkostenabrechnung.dto";
import { UpdateNebenkostenabrechnungDto } from "./dto/update-nebenkostenabrechnung.dto";

const INCLUDE = { objekt: { select: { id: true, name: true } } } as const;

@Injectable()
export class NebenkostenabrechnungenService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(mandantId: string): Promise<Nebenkostenabrechnung[]> {
    const abrechnungen = await this.prisma.nebenkostenabrechnung.findMany({
      where: { objekt: { mandantId } },
      include: INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return abrechnungen.map((a) => toNebenkostenabrechnung(a));
  }

  async findOne(mandantId: string, id: string): Promise<Nebenkostenabrechnung> {
    const abrechnung = await this.prisma.nebenkostenabrechnung.findFirst({
      where: { id, objekt: { mandantId } },
      include: { ...INCLUDE, positionen: true },
    });
    if (!abrechnung) throw new NotFoundException("Nebenkostenabrechnung nicht gefunden.");

    const einheiten = await this.prisma.einheit.findMany({
      where: { objektId: abrechnung.objektId },
      select: { id: true, name: true, flaeche: true },
    });

    return toNebenkostenabrechnung(abrechnung, computeKostenverteilung(abrechnung.positionen, einheiten));
  }

  async create(mandantId: string, dto: CreateNebenkostenabrechnungDto): Promise<Nebenkostenabrechnung> {
    const objekt = await this.prisma.objekt.findFirst({ where: { id: dto.objektId, mandantId } });
    if (!objekt) throw new NotFoundException("Objekt nicht gefunden.");

    const abrechnung = await this.prisma.nebenkostenabrechnung.create({
      data: {
        objektId: dto.objektId,
        zeitraumVon: new Date(dto.zeitraumVon),
        zeitraumBis: new Date(dto.zeitraumBis),
        status: dto.status ?? NebenkostenStatus.ENTWURF,
      },
      include: INCLUDE,
    });
    return toNebenkostenabrechnung(abrechnung);
  }

  async update(mandantId: string, id: string, dto: UpdateNebenkostenabrechnungDto): Promise<Nebenkostenabrechnung> {
    await this.findOne(mandantId, id);
    const abrechnung = await this.prisma.nebenkostenabrechnung.update({
      where: { id },
      data: {
        ...dto,
        zeitraumVon: dto.zeitraumVon ? new Date(dto.zeitraumVon) : undefined,
        zeitraumBis: dto.zeitraumBis ? new Date(dto.zeitraumBis) : undefined,
      },
      include: INCLUDE,
    });
    return toNebenkostenabrechnung(abrechnung);
  }

  async remove(mandantId: string, id: string): Promise<void> {
    await this.findOne(mandantId, id);
    await this.prisma.nebenkostenabrechnung.delete({ where: { id } });
  }
}

function computeKostenverteilung(
  positionen: { id: string; betrag: unknown; verteilerschluessel: string }[],
  einheiten: { id: string; name: string; flaeche: unknown }[],
): NebenkostenKostenanteil[] {
  if (einheiten.length === 0 || positionen.length === 0) {
    return einheiten.map((e) => ({ einheit: { id: e.id, name: e.name }, betrag: 0, positionen: [] }));
  }

  const gesamtFlaeche = einheiten.reduce((sum, e) => sum + Number(e.flaeche ?? 0), 0);

  const anteile = new Map<string, NebenkostenKostenanteil>(
    einheiten.map((e) => [e.id, { einheit: { id: e.id, name: e.name }, betrag: 0, positionen: [] }]),
  );

  for (const pos of positionen) {
    const betrag = Number(pos.betrag);
    for (const e of einheiten) {
      const anteil =
        pos.verteilerschluessel === "QM" && gesamtFlaeche > 0
          ? Number(e.flaeche ?? 0) / gesamtFlaeche
          : 1 / einheiten.length;
      const anteilBetrag = Math.round(betrag * anteil * 100) / 100;
      const eintrag = anteile.get(e.id)!;
      eintrag.positionen.push({ positionId: pos.id, betrag: anteilBetrag });
      eintrag.betrag = Math.round((eintrag.betrag + anteilBetrag) * 100) / 100;
    }
  }

  return Array.from(anteile.values());
}

function toNebenkostenabrechnung(
  abrechnung: {
    id: string;
    zeitraumVon: Date;
    zeitraumBis: Date;
    status: string;
    createdAt: Date;
    objekt: { id: string; name: string };
  },
  kostenverteilung?: NebenkostenKostenanteil[],
): Nebenkostenabrechnung {
  return {
    id: abrechnung.id,
    zeitraumVon: abrechnung.zeitraumVon.toISOString(),
    zeitraumBis: abrechnung.zeitraumBis.toISOString(),
    status: abrechnung.status as Nebenkostenabrechnung["status"],
    createdAt: abrechnung.createdAt.toISOString(),
    objekt: abrechnung.objekt,
    kostenverteilung,
  };
}
