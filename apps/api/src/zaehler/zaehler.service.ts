import { Injectable, NotFoundException } from "@nestjs/common";
import { Zaehler } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { CreateZaehlerDto } from "./dto/create-zaehler.dto";
import { UpdateZaehlerDto } from "./dto/update-zaehler.dto";

const INCLUDE = {
  objekt: { select: { id: true, name: true } },
  einheit: { select: { id: true, name: true, objekt: { select: { id: true, name: true } } } },
} as const;

@Injectable()
export class ZaehlerService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(mandantId: string): Promise<Zaehler[]> {
    const zaehler = await this.prisma.zaehler.findMany({
      where: { mandantId },
      include: INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return zaehler.map(toZaehler);
  }

  async findOne(mandantId: string, id: string): Promise<Zaehler> {
    const zaehler = await this.prisma.zaehler.findFirst({ where: { id, mandantId }, include: INCLUDE });
    if (!zaehler) throw new NotFoundException("Zähler nicht gefunden.");
    return toZaehler(zaehler);
  }

  async create(mandantId: string, dto: CreateZaehlerDto): Promise<Zaehler> {
    await this.assertRefsBelongToMandant(mandantId, dto.objektId, dto.einheitId);
    const zaehler = await this.prisma.zaehler.create({
      data: { ...dto, mandantId },
      include: INCLUDE,
    });
    return toZaehler(zaehler);
  }

  async update(mandantId: string, id: string, dto: UpdateZaehlerDto): Promise<Zaehler> {
    await this.findOne(mandantId, id);
    await this.assertRefsBelongToMandant(mandantId, dto.objektId, dto.einheitId);
    const zaehler = await this.prisma.zaehler.update({ where: { id }, data: dto, include: INCLUDE });
    return toZaehler(zaehler);
  }

  async remove(mandantId: string, id: string): Promise<void> {
    await this.findOne(mandantId, id);
    await this.prisma.zaehler.delete({ where: { id } });
  }

  private async assertRefsBelongToMandant(mandantId: string, objektId?: string, einheitId?: string) {
    if (objektId) {
      const objekt = await this.prisma.objekt.findFirst({ where: { id: objektId, mandantId } });
      if (!objekt) throw new NotFoundException("Objekt nicht gefunden.");
    }
    if (einheitId) {
      const einheit = await this.prisma.einheit.findFirst({
        where: { id: einheitId, objekt: { mandantId } },
      });
      if (!einheit) throw new NotFoundException("Einheit nicht gefunden.");
    }
  }
}

function toZaehler(zaehler: {
  id: string;
  typ: string;
  zaehlernummer: string;
  hauptzaehler: boolean;
  versorger: string | null;
  vertragsNr: string | null;
  lage: string | null;
  createdAt: Date;
  objekt: { id: string; name: string } | null;
  einheit: { id: string; name: string; objekt: { id: string; name: string } } | null;
}): Zaehler {
  return {
    id: zaehler.id,
    typ: zaehler.typ as Zaehler["typ"],
    zaehlernummer: zaehler.zaehlernummer,
    hauptzaehler: zaehler.hauptzaehler,
    versorger: zaehler.versorger,
    vertragsNr: zaehler.vertragsNr,
    lage: zaehler.lage,
    createdAt: zaehler.createdAt.toISOString(),
    objekt: zaehler.objekt,
    einheit: zaehler.einheit,
  };
}
