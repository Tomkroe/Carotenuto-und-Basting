import { Injectable, NotFoundException } from "@nestjs/common";
import { Vorgang, VorgangStatus } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVorgangDto } from "./dto/create-vorgang.dto";
import { UpdateVorgangDto } from "./dto/update-vorgang.dto";

const INCLUDE = {
  objekt: { select: { id: true, name: true } },
  kontakt: { select: { id: true, vorname: true, nachname: true, firma: true } },
  labels: { include: { label: { select: { id: true, name: true, farbe: true } } } },
} as const;

@Injectable()
export class VorgaengeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(mandantId: string): Promise<Vorgang[]> {
    const vorgaenge = await this.prisma.vorgang.findMany({
      where: { mandantId },
      include: INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return vorgaenge.map(toVorgang);
  }

  async findOne(mandantId: string, id: string): Promise<Vorgang> {
    const vorgang = await this.prisma.vorgang.findFirst({
      where: { id, mandantId },
      include: INCLUDE,
    });
    if (!vorgang) throw new NotFoundException("Vorgang nicht gefunden.");
    return toVorgang(vorgang);
  }

  async create(mandantId: string, dto: CreateVorgangDto): Promise<Vorgang> {
    await this.assertRefsBelongToMandant(mandantId, dto.objektId, dto.kontaktId);
    const vorgang = await this.prisma.vorgang.create({
      data: {
        titel: dto.titel,
        beschreibung: dto.beschreibung,
        status: dto.status ?? VorgangStatus.OFFEN,
        faelligkeit: dto.faelligkeit ? new Date(dto.faelligkeit) : undefined,
        objektId: dto.objektId,
        kontaktId: dto.kontaktId,
        mandantId,
      },
      include: INCLUDE,
    });
    return toVorgang(vorgang);
  }

  async update(mandantId: string, id: string, dto: UpdateVorgangDto): Promise<Vorgang> {
    await this.findOne(mandantId, id);
    await this.assertRefsBelongToMandant(mandantId, dto.objektId, dto.kontaktId);
    const vorgang = await this.prisma.vorgang.update({
      where: { id },
      data: {
        ...dto,
        faelligkeit: dto.faelligkeit ? new Date(dto.faelligkeit) : undefined,
      },
      include: INCLUDE,
    });
    return toVorgang(vorgang);
  }

  async remove(mandantId: string, id: string): Promise<void> {
    await this.findOne(mandantId, id);
    await this.prisma.vorgang.delete({ where: { id } });
  }

  private async assertRefsBelongToMandant(mandantId: string, objektId?: string, kontaktId?: string) {
    if (objektId) {
      const objekt = await this.prisma.objekt.findFirst({ where: { id: objektId, mandantId } });
      if (!objekt) throw new NotFoundException("Objekt nicht gefunden.");
    }
    if (kontaktId) {
      const kontakt = await this.prisma.kontakt.findFirst({ where: { id: kontaktId, mandantId } });
      if (!kontakt) throw new NotFoundException("Kontakt nicht gefunden.");
    }
  }
}

function toVorgang(vorgang: {
  id: string;
  nummer: number;
  titel: string;
  beschreibung: string | null;
  status: string;
  faelligkeit: Date | null;
  createdAt: Date;
  objekt: { id: string; name: string } | null;
  kontakt: { id: string; vorname: string | null; nachname: string | null; firma: string | null } | null;
  labels: { label: { id: string; name: string; farbe: string } }[];
}): Vorgang {
  return {
    id: vorgang.id,
    nummer: vorgang.nummer,
    titel: vorgang.titel,
    beschreibung: vorgang.beschreibung,
    status: vorgang.status as Vorgang["status"],
    faelligkeit: vorgang.faelligkeit ? vorgang.faelligkeit.toISOString() : null,
    createdAt: vorgang.createdAt.toISOString(),
    objekt: vorgang.objekt,
    kontakt: vorgang.kontakt,
    labels: vorgang.labels.map((l) => l.label),
  };
}
