import { Injectable, NotFoundException } from "@nestjs/common";
import { Beleg, BelegStatus } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBelegDto } from "./dto/create-beleg.dto";
import { UpdateBelegDto } from "./dto/update-beleg.dto";

const INCLUDE = {
  objekt: { select: { id: true, name: true } },
  kategorie: { select: { id: true, name: true } },
} as const;

interface FindAllParams {
  objektId?: string;
  status?: BelegStatus;
  von?: string;
  bis?: string;
}

@Injectable()
export class BelegeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(mandantId: string, params: FindAllParams): Promise<Beleg[]> {
    const belege = await this.prisma.beleg.findMany({
      where: {
        mandantId,
        objektId: params.objektId,
        status: params.status,
        belegdatum: {
          gte: params.von ? new Date(params.von) : undefined,
          lte: params.bis ? new Date(params.bis) : undefined,
        },
      },
      include: INCLUDE,
      orderBy: { belegdatum: "desc" },
    });
    return belege.map(toBeleg);
  }

  async create(mandantId: string, dto: CreateBelegDto): Promise<Beleg> {
    await this.assertRefsBelongToMandant(mandantId, dto.objektId, dto.kategorieId);
    const beleg = await this.prisma.beleg.create({
      data: {
        name: dto.name,
        belegnummer: dto.belegnummer,
        typ: dto.typ,
        betrag: dto.betrag,
        belegdatum: new Date(dto.belegdatum),
        status: dto.status,
        notiz: dto.notiz,
        objektId: dto.objektId,
        kategorieId: dto.kategorieId,
        mandantId,
      },
      include: INCLUDE,
    });
    return toBeleg(beleg);
  }

  async update(mandantId: string, id: string, dto: UpdateBelegDto): Promise<Beleg> {
    await this.findOneOrThrow(mandantId, id);
    await this.assertRefsBelongToMandant(mandantId, dto.objektId, dto.kategorieId);
    const beleg = await this.prisma.beleg.update({
      where: { id },
      data: {
        ...dto,
        belegdatum: dto.belegdatum ? new Date(dto.belegdatum) : undefined,
      },
      include: INCLUDE,
    });
    return toBeleg(beleg);
  }

  async remove(mandantId: string, id: string): Promise<void> {
    await this.findOneOrThrow(mandantId, id);
    await this.prisma.beleg.delete({ where: { id } });
  }

  private async findOneOrThrow(mandantId: string, id: string) {
    const existing = await this.prisma.beleg.findFirst({ where: { id, mandantId } });
    if (!existing) throw new NotFoundException("Beleg nicht gefunden.");
    return existing;
  }

  private async assertRefsBelongToMandant(mandantId: string, objektId?: string, kategorieId?: string) {
    if (objektId) {
      const objekt = await this.prisma.objekt.findFirst({ where: { id: objektId, mandantId } });
      if (!objekt) throw new NotFoundException("Objekt nicht gefunden.");
    }
    if (kategorieId) {
      const kategorie = await this.prisma.dokumentKategorie.findFirst({ where: { id: kategorieId, mandantId } });
      if (!kategorie) throw new NotFoundException("Kategorie nicht gefunden.");
    }
  }
}

function toBeleg(beleg: {
  id: string;
  name: string;
  belegnummer: string | null;
  typ: string;
  betrag: unknown;
  belegdatum: Date;
  status: string;
  notiz: string | null;
  createdAt: Date;
  objekt: { id: string; name: string } | null;
  kategorie: { id: string; name: string } | null;
}): Beleg {
  return {
    id: beleg.id,
    name: beleg.name,
    belegnummer: beleg.belegnummer,
    typ: beleg.typ as Beleg["typ"],
    betrag: Number(beleg.betrag),
    belegdatum: beleg.belegdatum.toISOString(),
    status: beleg.status as Beleg["status"],
    notiz: beleg.notiz,
    createdAt: beleg.createdAt.toISOString(),
    objekt: beleg.objekt,
    kategorie: beleg.kategorie,
  };
}
