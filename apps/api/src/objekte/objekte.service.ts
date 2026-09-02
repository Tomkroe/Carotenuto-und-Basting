import { randomUUID } from "node:crypto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Objekt } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";
import { CreateObjektDto } from "./dto/create-objekt.dto";
import { UpdateObjektDto } from "./dto/update-objekt.dto";

@Injectable()
export class ObjekteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async findAll(mandantId: string): Promise<Objekt[]> {
    const objekte = await this.prisma.objekt.findMany({
      where: { mandantId },
      include: { ansprechpartner: true },
      orderBy: { createdAt: "desc" },
    });
    return Promise.all(objekte.map((o) => this.toObjekt(o)));
  }

  async findOne(mandantId: string, id: string): Promise<Objekt> {
    const objekt = await this.prisma.objekt.findFirst({
      where: { id, mandantId },
      include: { ansprechpartner: true },
    });
    if (!objekt) throw new NotFoundException("Objekt nicht gefunden.");
    return this.toObjekt(objekt);
  }

  async create(mandantId: string, dto: CreateObjektDto): Promise<Objekt> {
    const objekt = await this.prisma.objekt.create({
      data: { ...dto, mandantId },
      include: { ansprechpartner: true },
    });
    return this.toObjekt(objekt);
  }

  async update(mandantId: string, id: string, dto: UpdateObjektDto): Promise<Objekt> {
    await this.findOne(mandantId, id);
    const objekt = await this.prisma.objekt.update({
      where: { id },
      data: dto,
      include: { ansprechpartner: true },
    });
    return this.toObjekt(objekt);
  }

  async remove(mandantId: string, id: string): Promise<void> {
    await this.findOne(mandantId, id);
    await this.prisma.objekt.delete({ where: { id } });
  }

  async uploadTitelbild(mandantId: string, id: string, file: Express.Multer.File): Promise<Objekt> {
    const existing = await this.prisma.objekt.findFirst({ where: { id, mandantId } });
    if (!existing) throw new NotFoundException("Objekt nicht gefunden.");

    if (existing.titelbildKey) await this.storage.deleteObject(existing.titelbildKey);

    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${mandantId}/objekte/${id}/titelbild-${randomUUID()}-${safeName}`;
    await this.storage.putObject(key, file.buffer, file.mimetype);

    const objekt = await this.prisma.objekt.update({
      where: { id },
      data: { titelbildKey: key },
      include: { ansprechpartner: true },
    });
    return this.toObjekt(objekt);
  }

  async removeTitelbild(mandantId: string, id: string): Promise<Objekt> {
    const existing = await this.prisma.objekt.findFirst({ where: { id, mandantId } });
    if (!existing) throw new NotFoundException("Objekt nicht gefunden.");
    if (existing.titelbildKey) await this.storage.deleteObject(existing.titelbildKey);

    const objekt = await this.prisma.objekt.update({
      where: { id },
      data: { titelbildKey: null },
      include: { ansprechpartner: true },
    });
    return this.toObjekt(objekt);
  }

  private async toObjekt(objekt: {
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
    hausgeld: unknown;
    eigenschaften: unknown;
    titelbildKey: string | null;
    abrechnungszeitraumStart: string | null;
    abrechnungszeitraumEnde: string | null;
    bankKontoinhaber: string | null;
    bankIban: string | null;
    bankBic: string | null;
    ansprechpartner: { id: string; vorname: string | null; nachname: string | null; firma: string | null } | null;
    createdAt: Date;
  }): Promise<Objekt> {
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
      hausgeld: objekt.hausgeld != null ? Number(objekt.hausgeld) : null,
      eigenschaften: Array.isArray(objekt.eigenschaften) ? (objekt.eigenschaften as string[]) : [],
      ansprechpartner: objekt.ansprechpartner,
      titelbildUrl: objekt.titelbildKey ? await this.storage.getPresignedDownloadUrl(objekt.titelbildKey) : null,
      abrechnungszeitraumStart: objekt.abrechnungszeitraumStart,
      abrechnungszeitraumEnde: objekt.abrechnungszeitraumEnde,
      bankKontoinhaber: objekt.bankKontoinhaber,
      bankIban: objekt.bankIban,
      bankBic: objekt.bankBic,
      createdAt: objekt.createdAt.toISOString(),
    };
  }
}
