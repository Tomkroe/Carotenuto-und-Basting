import { Injectable, NotFoundException } from "@nestjs/common";
import { Objekt } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { CreateObjektDto } from "./dto/create-objekt.dto";
import { UpdateObjektDto } from "./dto/update-objekt.dto";

@Injectable()
export class ObjekteService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(mandantId: string): Promise<Objekt[]> {
    const objekte = await this.prisma.objekt.findMany({
      where: { mandantId },
      orderBy: { createdAt: "desc" },
    });
    return objekte.map(toObjekt);
  }

  async findOne(mandantId: string, id: string): Promise<Objekt> {
    const objekt = await this.prisma.objekt.findFirst({ where: { id, mandantId } });
    if (!objekt) throw new NotFoundException("Objekt nicht gefunden.");
    return toObjekt(objekt);
  }

  async create(mandantId: string, dto: CreateObjektDto): Promise<Objekt> {
    const objekt = await this.prisma.objekt.create({
      data: { ...dto, mandantId },
    });
    return toObjekt(objekt);
  }

  async update(mandantId: string, id: string, dto: UpdateObjektDto): Promise<Objekt> {
    await this.findOne(mandantId, id);
    const objekt = await this.prisma.objekt.update({ where: { id }, data: dto });
    return toObjekt(objekt);
  }

  async remove(mandantId: string, id: string): Promise<void> {
    await this.findOne(mandantId, id);
    await this.prisma.objekt.delete({ where: { id } });
  }
}

function toObjekt(objekt: {
  id: string;
  typ: string;
  name: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  land: string;
  kaltmiete: unknown;
  flaeche: unknown;
  eigenschaften: unknown;
  createdAt: Date;
}): Objekt {
  return {
    id: objekt.id,
    typ: objekt.typ as Objekt["typ"],
    name: objekt.name,
    strasse: objekt.strasse,
    hausnummer: objekt.hausnummer,
    plz: objekt.plz,
    ort: objekt.ort,
    land: objekt.land,
    kaltmiete: objekt.kaltmiete != null ? Number(objekt.kaltmiete) : null,
    flaeche: objekt.flaeche != null ? Number(objekt.flaeche) : null,
    eigenschaften: Array.isArray(objekt.eigenschaften) ? (objekt.eigenschaften as string[]) : [],
    createdAt: objekt.createdAt.toISOString(),
  };
}
