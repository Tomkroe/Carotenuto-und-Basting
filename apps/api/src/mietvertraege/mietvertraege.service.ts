import { Injectable, NotFoundException } from "@nestjs/common";
import { Mietvertrag, MietvertragStatus } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMietvertragDto } from "./dto/create-mietvertrag.dto";
import { UpdateMietvertragDto } from "./dto/update-mietvertrag.dto";

const INCLUDE = {
  einheit: { select: { id: true, name: true, objekt: { select: { id: true, name: true } } } },
  mieter: { select: { id: true, vorname: true, nachname: true, firma: true } },
} as const;

@Injectable()
export class MietvertraegeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(mandantId: string): Promise<Mietvertrag[]> {
    const mietvertraege = await this.prisma.mietvertrag.findMany({
      where: { einheit: { objekt: { mandantId } } },
      include: INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return mietvertraege.map(toMietvertrag);
  }

  async findOne(mandantId: string, id: string): Promise<Mietvertrag> {
    const mietvertrag = await this.prisma.mietvertrag.findFirst({
      where: { id, einheit: { objekt: { mandantId } } },
      include: INCLUDE,
    });
    if (!mietvertrag) throw new NotFoundException("Mietvertrag nicht gefunden.");
    return toMietvertrag(mietvertrag);
  }

  async create(mandantId: string, dto: CreateMietvertragDto): Promise<Mietvertrag> {
    await this.assertRefsBelongToMandant(mandantId, dto.einheitId, dto.mieterId);
    const mietvertrag = await this.prisma.mietvertrag.create({
      data: {
        einheitId: dto.einheitId,
        mieterId: dto.mieterId,
        kaltmiete: dto.kaltmiete,
        nebenkostenVorauszahlung: dto.nebenkostenVorauszahlung ?? 0,
        kaution: dto.kaution,
        iban: dto.iban,
        sepaLastschrift: dto.sepaLastschrift ?? false,
        beginn: new Date(dto.beginn),
        ende: dto.ende ? new Date(dto.ende) : undefined,
        status: dto.status ?? MietvertragStatus.GEPLANT,
      },
      include: INCLUDE,
    });
    return toMietvertrag(mietvertrag);
  }

  async update(mandantId: string, id: string, dto: UpdateMietvertragDto): Promise<Mietvertrag> {
    await this.findOne(mandantId, id);
    await this.assertRefsBelongToMandant(mandantId, dto.einheitId, dto.mieterId);
    const mietvertrag = await this.prisma.mietvertrag.update({
      where: { id },
      data: {
        ...dto,
        beginn: dto.beginn ? new Date(dto.beginn) : undefined,
        ende: dto.ende ? new Date(dto.ende) : undefined,
      },
      include: INCLUDE,
    });
    return toMietvertrag(mietvertrag);
  }

  async remove(mandantId: string, id: string): Promise<void> {
    await this.findOne(mandantId, id);
    await this.prisma.mietvertrag.delete({ where: { id } });
  }

  private async assertRefsBelongToMandant(mandantId: string, einheitId?: string, mieterId?: string) {
    if (einheitId) {
      const einheit = await this.prisma.einheit.findFirst({
        where: { id: einheitId, objekt: { mandantId } },
      });
      if (!einheit) throw new NotFoundException("Einheit nicht gefunden.");
    }
    if (mieterId) {
      const kontakt = await this.prisma.kontakt.findFirst({ where: { id: mieterId, mandantId } });
      if (!kontakt) throw new NotFoundException("Kontakt nicht gefunden.");
    }
  }
}

function toMietvertrag(mietvertrag: {
  id: string;
  kaltmiete: unknown;
  nebenkostenVorauszahlung: unknown;
  kaution: unknown;
  iban: string | null;
  sepaLastschrift: boolean;
  beginn: Date;
  ende: Date | null;
  status: string;
  createdAt: Date;
  einheit: { id: string; name: string; objekt: { id: string; name: string } };
  mieter: { id: string; vorname: string | null; nachname: string | null; firma: string | null };
}): Mietvertrag {
  return {
    id: mietvertrag.id,
    kaltmiete: Number(mietvertrag.kaltmiete),
    nebenkostenVorauszahlung: Number(mietvertrag.nebenkostenVorauszahlung),
    kaution: mietvertrag.kaution != null ? Number(mietvertrag.kaution) : null,
    iban: mietvertrag.iban,
    sepaLastschrift: mietvertrag.sepaLastschrift,
    beginn: mietvertrag.beginn.toISOString(),
    ende: mietvertrag.ende ? mietvertrag.ende.toISOString() : null,
    status: mietvertrag.status as Mietvertrag["status"],
    createdAt: mietvertrag.createdAt.toISOString(),
    einheit: mietvertrag.einheit,
    mieter: mietvertrag.mieter,
  };
}
