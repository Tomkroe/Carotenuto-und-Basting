import { Injectable, NotFoundException } from "@nestjs/common";
import { NebenkostenPosition } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { CreateNebenkostenPositionDto } from "./dto/create-nebenkostenposition.dto";

@Injectable()
export class NebenkostenpositionenService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForAbrechnung(mandantId: string, nebenkostenabrechnungId: string): Promise<NebenkostenPosition[]> {
    await this.assertAbrechnungOwnership(mandantId, nebenkostenabrechnungId);
    const positionen = await this.prisma.nebenkostenPosition.findMany({
      where: { nebenkostenabrechnungId },
      orderBy: { id: "asc" },
    });
    return positionen.map(toPosition);
  }

  async create(
    mandantId: string,
    nebenkostenabrechnungId: string,
    dto: CreateNebenkostenPositionDto,
  ): Promise<NebenkostenPosition> {
    await this.assertAbrechnungOwnership(mandantId, nebenkostenabrechnungId);
    const position = await this.prisma.nebenkostenPosition.create({
      data: { ...dto, nebenkostenabrechnungId },
    });
    return toPosition(position);
  }

  async remove(mandantId: string, id: string): Promise<void> {
    const existing = await this.prisma.nebenkostenPosition.findFirst({
      where: { id, nebenkostenabrechnung: { objekt: { mandantId } } },
    });
    if (!existing) throw new NotFoundException("Position nicht gefunden.");
    await this.prisma.nebenkostenPosition.delete({ where: { id } });
  }

  private async assertAbrechnungOwnership(mandantId: string, nebenkostenabrechnungId: string): Promise<void> {
    const abrechnung = await this.prisma.nebenkostenabrechnung.findFirst({
      where: { id: nebenkostenabrechnungId, objekt: { mandantId } },
    });
    if (!abrechnung) throw new NotFoundException("Nebenkostenabrechnung nicht gefunden.");
  }
}

function toPosition(position: {
  id: string;
  bezeichnung: string;
  betrag: unknown;
  verteilerschluessel: string;
  nebenkostenabrechnungId: string;
}): NebenkostenPosition {
  return {
    id: position.id,
    bezeichnung: position.bezeichnung,
    betrag: Number(position.betrag),
    verteilerschluessel: position.verteilerschluessel as NebenkostenPosition["verteilerschluessel"],
    nebenkostenabrechnungId: position.nebenkostenabrechnungId,
  };
}
