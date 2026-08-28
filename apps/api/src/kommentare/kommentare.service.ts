import { Injectable, NotFoundException } from "@nestjs/common";
import { Kommentar } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { CreateKommentarDto } from "./dto/create-kommentar.dto";

@Injectable()
export class KommentareService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForVorgang(mandantId: string, vorgangId: string): Promise<Kommentar[]> {
    await this.assertVorgangOwnership(mandantId, vorgangId);
    const kommentare = await this.prisma.kommentar.findMany({
      where: { vorgangId },
      include: { autor: { select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" },
    });
    return kommentare.map(toKommentar);
  }

  async create(mandantId: string, vorgangId: string, autorId: string, dto: CreateKommentarDto): Promise<Kommentar> {
    await this.assertVorgangOwnership(mandantId, vorgangId);
    const kommentar = await this.prisma.kommentar.create({
      data: { text: dto.text, vorgangId, autorId },
      include: { autor: { select: { id: true, name: true } } },
    });
    return toKommentar(kommentar);
  }

  private async assertVorgangOwnership(mandantId: string, vorgangId: string): Promise<void> {
    const vorgang = await this.prisma.vorgang.findFirst({ where: { id: vorgangId, mandantId } });
    if (!vorgang) throw new NotFoundException("Vorgang nicht gefunden.");
  }
}

function toKommentar(kommentar: {
  id: string;
  text: string;
  vorgangId: string;
  createdAt: Date;
  autor: { id: string; name: string };
}): Kommentar {
  return {
    id: kommentar.id,
    text: kommentar.text,
    vorgangId: kommentar.vorgangId,
    createdAt: kommentar.createdAt.toISOString(),
    autor: kommentar.autor,
  };
}
