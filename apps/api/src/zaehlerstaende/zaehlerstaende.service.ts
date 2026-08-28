import { Injectable, NotFoundException } from "@nestjs/common";
import { Zaehlerstand } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { CreateZaehlerstandDto } from "./dto/create-zaehlerstand.dto";

@Injectable()
export class ZaehlerstaendeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForZaehler(mandantId: string, zaehlerId: string): Promise<Zaehlerstand[]> {
    await this.assertZaehlerOwnership(mandantId, zaehlerId);
    const zaehlerstaende = await this.prisma.zaehlerstand.findMany({
      where: { zaehlerId },
      orderBy: { datum: "desc" },
    });
    return zaehlerstaende.map(toZaehlerstand);
  }

  async create(mandantId: string, zaehlerId: string, dto: CreateZaehlerstandDto): Promise<Zaehlerstand> {
    await this.assertZaehlerOwnership(mandantId, zaehlerId);
    const zaehlerstand = await this.prisma.zaehlerstand.create({
      data: { datum: new Date(dto.datum), wert: dto.wert, zaehlerId },
    });
    return toZaehlerstand(zaehlerstand);
  }

  async remove(mandantId: string, id: string): Promise<void> {
    const existing = await this.prisma.zaehlerstand.findFirst({
      where: { id, zaehler: { mandantId } },
    });
    if (!existing) throw new NotFoundException("Zählerstand nicht gefunden.");
    await this.prisma.zaehlerstand.delete({ where: { id } });
  }

  private async assertZaehlerOwnership(mandantId: string, zaehlerId: string): Promise<void> {
    const zaehler = await this.prisma.zaehler.findFirst({ where: { id: zaehlerId, mandantId } });
    if (!zaehler) throw new NotFoundException("Zähler nicht gefunden.");
  }
}

function toZaehlerstand(zaehlerstand: {
  id: string;
  datum: Date;
  wert: unknown;
  zaehlerId: string;
  createdAt: Date;
}): Zaehlerstand {
  return {
    id: zaehlerstand.id,
    datum: zaehlerstand.datum.toISOString(),
    wert: Number(zaehlerstand.wert),
    zaehlerId: zaehlerstand.zaehlerId,
    createdAt: zaehlerstand.createdAt.toISOString(),
  };
}
