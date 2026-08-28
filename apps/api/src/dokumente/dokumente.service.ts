import { randomUUID } from "node:crypto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Dokument } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";

const INCLUDE = { hochgeladenVon: { select: { id: true, name: true } } } as const;

@Injectable()
export class DokumenteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async findAllForObjekt(mandantId: string, objektId: string): Promise<Dokument[]> {
    await this.assertObjektOwnership(mandantId, objektId);
    return this.findAll({ objektId });
  }

  async uploadForObjekt(
    mandantId: string,
    objektId: string,
    hochgeladenVonId: string,
    file: Express.Multer.File,
  ): Promise<Dokument> {
    await this.assertObjektOwnership(mandantId, objektId);
    return this.upload(mandantId, hochgeladenVonId, file, `objekte/${objektId}`, { objektId });
  }

  async findAllForVorgang(mandantId: string, vorgangId: string): Promise<Dokument[]> {
    await this.assertVorgangOwnership(mandantId, vorgangId);
    return this.findAll({ vorgangId });
  }

  async uploadForVorgang(
    mandantId: string,
    vorgangId: string,
    hochgeladenVonId: string,
    file: Express.Multer.File,
  ): Promise<Dokument> {
    await this.assertVorgangOwnership(mandantId, vorgangId);
    return this.upload(mandantId, hochgeladenVonId, file, `vorgaenge/${vorgangId}`, { vorgangId });
  }

  async findAllForMietvertrag(mandantId: string, mietvertragId: string): Promise<Dokument[]> {
    await this.assertMietvertragOwnership(mandantId, mietvertragId);
    return this.findAll({ mietvertragId });
  }

  async uploadForMietvertrag(
    mandantId: string,
    mietvertragId: string,
    hochgeladenVonId: string,
    file: Express.Multer.File,
  ): Promise<Dokument> {
    await this.assertMietvertragOwnership(mandantId, mietvertragId);
    return this.upload(mandantId, hochgeladenVonId, file, `mietvertraege/${mietvertragId}`, { mietvertragId });
  }

  async getDownloadUrl(mandantId: string, id: string): Promise<string> {
    const dokument = await this.prisma.dokument.findFirst({ where: { id, mandantId } });
    if (!dokument) throw new NotFoundException("Dokument nicht gefunden.");
    return this.storage.getPresignedDownloadUrl(dokument.speicherKey);
  }

  async remove(mandantId: string, id: string): Promise<void> {
    const dokument = await this.prisma.dokument.findFirst({ where: { id, mandantId } });
    if (!dokument) throw new NotFoundException("Dokument nicht gefunden.");
    await this.storage.deleteObject(dokument.speicherKey);
    await this.prisma.dokument.delete({ where: { id } });
  }

  private async findAll(where: Prisma.DokumentWhereInput): Promise<Dokument[]> {
    const dokumente = await this.prisma.dokument.findMany({
      where,
      include: INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return dokumente.map(toDokument);
  }

  private async upload(
    mandantId: string,
    hochgeladenVonId: string,
    file: Express.Multer.File,
    keyPrefix: string,
    fk: Partial<Pick<Prisma.DokumentUncheckedCreateInput, "objektId" | "vorgangId" | "mietvertragId">>,
  ): Promise<Dokument> {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${mandantId}/${keyPrefix}/${randomUUID()}-${safeName}`;
    await this.storage.putObject(key, file.buffer, file.mimetype);

    const dokument = await this.prisma.dokument.create({
      data: {
        dateiname: file.originalname,
        speicherKey: key,
        mimeType: file.mimetype,
        groesseBytes: file.size,
        mandantId,
        hochgeladenVonId,
        ...fk,
      },
      include: INCLUDE,
    });
    return toDokument(dokument);
  }

  private async assertObjektOwnership(mandantId: string, objektId: string): Promise<void> {
    const objekt = await this.prisma.objekt.findFirst({ where: { id: objektId, mandantId } });
    if (!objekt) throw new NotFoundException("Objekt nicht gefunden.");
  }

  private async assertVorgangOwnership(mandantId: string, vorgangId: string): Promise<void> {
    const vorgang = await this.prisma.vorgang.findFirst({ where: { id: vorgangId, mandantId } });
    if (!vorgang) throw new NotFoundException("Vorgang nicht gefunden.");
  }

  private async assertMietvertragOwnership(mandantId: string, mietvertragId: string): Promise<void> {
    const mietvertrag = await this.prisma.mietvertrag.findFirst({
      where: { id: mietvertragId, einheit: { objekt: { mandantId } } },
    });
    if (!mietvertrag) throw new NotFoundException("Mietvertrag nicht gefunden.");
  }
}

function toDokument(dokument: {
  id: string;
  dateiname: string;
  mimeType: string;
  groesseBytes: number;
  createdAt: Date;
  hochgeladenVon: { id: string; name: string };
}): Dokument {
  return {
    id: dokument.id,
    dateiname: dokument.dateiname,
    mimeType: dokument.mimeType,
    groesseBytes: dokument.groesseBytes,
    createdAt: dokument.createdAt.toISOString(),
    hochgeladenVon: dokument.hochgeladenVon,
  };
}
