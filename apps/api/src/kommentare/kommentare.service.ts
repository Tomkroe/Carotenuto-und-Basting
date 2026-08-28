import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Kommentar } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { CreateKommentarDto } from "./dto/create-kommentar.dto";

const INCLUDE = { autor: { select: { id: true, name: true } } } as const;

@Injectable()
export class KommentareService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForVorgang(mandantId: string, vorgangId: string): Promise<Kommentar[]> {
    await this.assertVorgangOwnership(mandantId, vorgangId);
    return this.findAll({ vorgangId });
  }

  async createForVorgang(
    mandantId: string,
    vorgangId: string,
    autorId: string,
    dto: CreateKommentarDto,
  ): Promise<Kommentar> {
    await this.assertVorgangOwnership(mandantId, vorgangId);
    return this.create(autorId, dto, { vorgangId });
  }

  async findAllForNebenkostenabrechnung(mandantId: string, nebenkostenabrechnungId: string): Promise<Kommentar[]> {
    await this.assertNebenkostenabrechnungOwnership(mandantId, nebenkostenabrechnungId);
    return this.findAll({ nebenkostenabrechnungId });
  }

  async createForNebenkostenabrechnung(
    mandantId: string,
    nebenkostenabrechnungId: string,
    autorId: string,
    dto: CreateKommentarDto,
  ): Promise<Kommentar> {
    await this.assertNebenkostenabrechnungOwnership(mandantId, nebenkostenabrechnungId);
    return this.create(autorId, dto, { nebenkostenabrechnungId });
  }

  private async findAll(where: Prisma.KommentarWhereInput): Promise<Kommentar[]> {
    const kommentare = await this.prisma.kommentar.findMany({
      where,
      include: INCLUDE,
      orderBy: { createdAt: "asc" },
    });
    return kommentare.map(toKommentar);
  }

  private async create(
    autorId: string,
    dto: CreateKommentarDto,
    fk: Pick<Prisma.KommentarUncheckedCreateInput, "vorgangId"> | Pick<Prisma.KommentarUncheckedCreateInput, "nebenkostenabrechnungId">,
  ): Promise<Kommentar> {
    const kommentar = await this.prisma.kommentar.create({
      data: { text: dto.text, autorId, ...fk },
      include: INCLUDE,
    });
    return toKommentar(kommentar);
  }

  private async assertVorgangOwnership(mandantId: string, vorgangId: string): Promise<void> {
    const vorgang = await this.prisma.vorgang.findFirst({ where: { id: vorgangId, mandantId } });
    if (!vorgang) throw new NotFoundException("Vorgang nicht gefunden.");
  }

  private async assertNebenkostenabrechnungOwnership(mandantId: string, id: string): Promise<void> {
    const abrechnung = await this.prisma.nebenkostenabrechnung.findFirst({
      where: { id, objekt: { mandantId } },
    });
    if (!abrechnung) throw new NotFoundException("Nebenkostenabrechnung nicht gefunden.");
  }
}

function toKommentar(kommentar: {
  id: string;
  text: string;
  createdAt: Date;
  autor: { id: string; name: string };
}): Kommentar {
  return {
    id: kommentar.id,
    text: kommentar.text,
    createdAt: kommentar.createdAt.toISOString(),
    autor: kommentar.autor,
  };
}
