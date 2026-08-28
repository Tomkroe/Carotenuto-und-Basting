import { Injectable, NotFoundException } from "@nestjs/common";
import { Kontakt } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { CreateKontaktDto } from "./dto/create-kontakt.dto";
import { UpdateKontaktDto } from "./dto/update-kontakt.dto";

@Injectable()
export class KontakteService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(mandantId: string): Promise<Kontakt[]> {
    const kontakte = await this.prisma.kontakt.findMany({
      where: { mandantId },
      orderBy: { createdAt: "desc" },
    });
    return kontakte.map(toKontakt);
  }

  async findOne(mandantId: string, id: string): Promise<Kontakt> {
    const kontakt = await this.prisma.kontakt.findFirst({ where: { id, mandantId } });
    if (!kontakt) throw new NotFoundException("Kontakt nicht gefunden.");
    return toKontakt(kontakt);
  }

  async create(mandantId: string, dto: CreateKontaktDto): Promise<Kontakt> {
    const kontakt = await this.prisma.kontakt.create({
      data: { ...dto, mandantId },
    });
    return toKontakt(kontakt);
  }

  async update(mandantId: string, id: string, dto: UpdateKontaktDto): Promise<Kontakt> {
    await this.findOne(mandantId, id);
    const kontakt = await this.prisma.kontakt.update({ where: { id }, data: dto });
    return toKontakt(kontakt);
  }

  async remove(mandantId: string, id: string): Promise<void> {
    await this.findOne(mandantId, id);
    await this.prisma.kontakt.delete({ where: { id } });
  }
}

function toKontakt(kontakt: {
  id: string;
  typ: string;
  vorname: string | null;
  nachname: string | null;
  firma: string | null;
  email: string | null;
  telefon: string | null;
  createdAt: Date;
}): Kontakt {
  return {
    id: kontakt.id,
    typ: kontakt.typ as Kontakt["typ"],
    vorname: kontakt.vorname,
    nachname: kontakt.nachname,
    firma: kontakt.firma,
    email: kontakt.email,
    telefon: kontakt.telefon,
    createdAt: kontakt.createdAt.toISOString(),
  };
}
