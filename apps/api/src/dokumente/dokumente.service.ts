import { randomUUID } from "node:crypto";
import { Injectable, NotFoundException } from "@nestjs/common";
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

  async findAllForMietvertrag(mandantId: string, mietvertragId: string): Promise<Dokument[]> {
    await this.assertMietvertragOwnership(mandantId, mietvertragId);
    const dokumente = await this.prisma.dokument.findMany({
      where: { mietvertragId },
      include: INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return dokumente.map(toDokument);
  }

  async uploadForMietvertrag(
    mandantId: string,
    mietvertragId: string,
    hochgeladenVonId: string,
    file: Express.Multer.File,
  ): Promise<Dokument> {
    await this.assertMietvertragOwnership(mandantId, mietvertragId);

    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${mandantId}/mietvertraege/${mietvertragId}/${randomUUID()}-${safeName}`;
    await this.storage.putObject(key, file.buffer, file.mimetype);

    const dokument = await this.prisma.dokument.create({
      data: {
        dateiname: file.originalname,
        speicherKey: key,
        mimeType: file.mimetype,
        groesseBytes: file.size,
        mandantId,
        hochgeladenVonId,
        mietvertragId,
      },
      include: INCLUDE,
    });
    return toDokument(dokument);
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
