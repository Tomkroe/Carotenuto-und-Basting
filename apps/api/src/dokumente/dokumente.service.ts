import { randomUUID } from "node:crypto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Dokument, DokumentMitZuordnung } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";
import { UpdateDokumentDto } from "./dto/update-dokument.dto";

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

  async findAllForNebenkostenabrechnung(mandantId: string, nebenkostenabrechnungId: string): Promise<Dokument[]> {
    await this.assertNebenkostenabrechnungOwnership(mandantId, nebenkostenabrechnungId);
    return this.findAll({ nebenkostenabrechnungId });
  }

  async uploadForNebenkostenabrechnung(
    mandantId: string,
    nebenkostenabrechnungId: string,
    hochgeladenVonId: string,
    file: Express.Multer.File,
  ): Promise<Dokument> {
    await this.assertNebenkostenabrechnungOwnership(mandantId, nebenkostenabrechnungId);
    return this.upload(mandantId, hochgeladenVonId, file, `nebenkostenabrechnungen/${nebenkostenabrechnungId}`, {
      nebenkostenabrechnungId,
    });
  }

  async findAllForKontakt(mandantId: string, kontaktId: string): Promise<Dokument[]> {
    await this.assertKontaktOwnership(mandantId, kontaktId);
    return this.findAll({ kontaktId });
  }

  async uploadForKontakt(
    mandantId: string,
    kontaktId: string,
    hochgeladenVonId: string,
    file: Express.Multer.File,
  ): Promise<Dokument> {
    await this.assertKontaktOwnership(mandantId, kontaktId);
    return this.upload(mandantId, hochgeladenVonId, file, `kontakte/${kontaktId}`, { kontaktId });
  }

  async findAllForMandant(mandantId: string): Promise<DokumentMitZuordnung[]> {
    const dokumente = await this.prisma.dokument.findMany({
      where: { mandantId },
      include: {
        ...INCLUDE,
        objekt: { select: { name: true } },
        vorgang: { select: { nummer: true, titel: true } },
        mietvertrag: { include: { einheit: { include: { objekt: { select: { name: true } } } } } },
        nebenkostenabrechnung: { include: { objekt: { select: { name: true } } } },
        kontakt: { select: { vorname: true, nachname: true, firma: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return dokumente.map(toDokumentMitZuordnung);
  }

  async getDownloadUrl(mandantId: string, id: string): Promise<string> {
    const dokument = await this.prisma.dokument.findFirst({ where: { id, mandantId } });
    if (!dokument) throw new NotFoundException("Dokument nicht gefunden.");
    return this.storage.getPresignedDownloadUrl(dokument.speicherKey);
  }

  async update(mandantId: string, id: string, dto: UpdateDokumentDto): Promise<Dokument> {
    const existing = await this.prisma.dokument.findFirst({ where: { id, mandantId } });
    if (!existing) throw new NotFoundException("Dokument nicht gefunden.");
    const dokument = await this.prisma.dokument.update({
      where: { id },
      data: { kategorie: dto.kategorie },
      include: INCLUDE,
    });
    return toDokument(dokument);
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
    fk: Partial<
      Pick<
        Prisma.DokumentUncheckedCreateInput,
        "objektId" | "vorgangId" | "mietvertragId" | "nebenkostenabrechnungId" | "kontaktId"
      >
    >,
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

  private async assertNebenkostenabrechnungOwnership(mandantId: string, id: string): Promise<void> {
    const abrechnung = await this.prisma.nebenkostenabrechnung.findFirst({
      where: { id, objekt: { mandantId } },
    });
    if (!abrechnung) throw new NotFoundException("Nebenkostenabrechnung nicht gefunden.");
  }

  private async assertKontaktOwnership(mandantId: string, kontaktId: string): Promise<void> {
    const kontakt = await this.prisma.kontakt.findFirst({ where: { id: kontaktId, mandantId } });
    if (!kontakt) throw new NotFoundException("Kontakt nicht gefunden.");
  }
}

function toDokument(dokument: {
  id: string;
  dateiname: string;
  mimeType: string;
  groesseBytes: number;
  kategorie: string | null;
  createdAt: Date;
  hochgeladenVon: { id: string; name: string };
}): Dokument {
  return {
    id: dokument.id,
    dateiname: dokument.dateiname,
    mimeType: dokument.mimeType,
    groesseBytes: dokument.groesseBytes,
    kategorie: dokument.kategorie as Dokument["kategorie"],
    createdAt: dokument.createdAt.toISOString(),
    hochgeladenVon: dokument.hochgeladenVon,
  };
}

function kontaktName(k: { vorname: string | null; nachname: string | null; firma: string | null }): string {
  return [k.vorname, k.nachname].filter(Boolean).join(" ") || k.firma || "Unbenannt";
}

function toDokumentMitZuordnung(dokument: Parameters<typeof toDokument>[0] & {
  objekt: { name: string } | null;
  vorgang: { nummer: number; titel: string } | null;
  mietvertrag: { einheit: { name: string; objekt: { name: string } } } | null;
  nebenkostenabrechnung: { objekt: { name: string } } | null;
  kontakt: { vorname: string | null; nachname: string | null; firma: string | null } | null;
}): DokumentMitZuordnung {
  let zugeordnetZu: string | null = null;
  let zugeordnetTyp: DokumentMitZuordnung["zugeordnetTyp"] = null;

  if (dokument.objekt) {
    zugeordnetZu = dokument.objekt.name;
    zugeordnetTyp = "objekt";
  } else if (dokument.vorgang) {
    zugeordnetZu = `Vorgang #${dokument.vorgang.nummer} · ${dokument.vorgang.titel}`;
    zugeordnetTyp = "vorgang";
  } else if (dokument.mietvertrag) {
    zugeordnetZu = `${dokument.mietvertrag.einheit.objekt.name} · ${dokument.mietvertrag.einheit.name}`;
    zugeordnetTyp = "mietvertrag";
  } else if (dokument.nebenkostenabrechnung) {
    zugeordnetZu = `Nebenkosten · ${dokument.nebenkostenabrechnung.objekt.name}`;
    zugeordnetTyp = "nebenkostenabrechnung";
  } else if (dokument.kontakt) {
    zugeordnetZu = kontaktName(dokument.kontakt);
    zugeordnetTyp = "kontakt";
  }

  return { ...toDokument(dokument), zugeordnetZu, zugeordnetTyp };
}
