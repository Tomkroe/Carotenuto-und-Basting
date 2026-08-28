import { Injectable, NotFoundException } from "@nestjs/common";
import { Nebenkostenabrechnung, NebenkostenStatus } from "@maklerprogram/types";
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
    return abrechnungen.map(toNebenkostenabrechnung);
  }

  async findOne(mandantId: string, id: string): Promise<Nebenkostenabrechnung> {
    const abrechnung = await this.prisma.nebenkostenabrechnung.findFirst({
      where: { id, objekt: { mandantId } },
      include: INCLUDE,
    });
    if (!abrechnung) throw new NotFoundException("Nebenkostenabrechnung nicht gefunden.");
    return toNebenkostenabrechnung(abrechnung);
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

function toNebenkostenabrechnung(abrechnung: {
  id: string;
  zeitraumVon: Date;
  zeitraumBis: Date;
  status: string;
  createdAt: Date;
  objekt: { id: string; name: string };
}): Nebenkostenabrechnung {
  return {
    id: abrechnung.id,
    zeitraumVon: abrechnung.zeitraumVon.toISOString(),
    zeitraumBis: abrechnung.zeitraumBis.toISOString(),
    status: abrechnung.status as Nebenkostenabrechnung["status"],
    createdAt: abrechnung.createdAt.toISOString(),
    objekt: abrechnung.objekt,
  };
}
