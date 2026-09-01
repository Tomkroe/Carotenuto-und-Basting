import { Injectable, NotFoundException } from "@nestjs/common";
import { Vorgang, VorgangStatus } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVorgangDto } from "./dto/create-vorgang.dto";
import { UpdateVorgangDto } from "./dto/update-vorgang.dto";
import { VerlaufService } from "./verlauf.service";

const INCLUDE = {
  objekt: { select: { id: true, name: true } },
  einheit: { select: { id: true, name: true, objekt: { select: { id: true, name: true } } } },
  kontakt: { select: { id: true, vorname: true, nachname: true, firma: true } },
  verantwortlicher: { select: { id: true, name: true } },
  labels: { include: { label: { select: { id: true, name: true, farbe: true } } } },
} as const;

const STATUS_LABEL: Record<VorgangStatus, string> = {
  [VorgangStatus.OFFEN]: "Offen",
  [VorgangStatus.IN_BEARBEITUNG]: "In Bearbeitung",
  [VorgangStatus.ABGESCHLOSSEN]: "Abgeschlossen",
};

@Injectable()
export class VorgaengeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly verlaufService: VerlaufService,
  ) {}

  async findAll(mandantId: string): Promise<Vorgang[]> {
    const vorgaenge = await this.prisma.vorgang.findMany({
      where: { mandantId },
      include: INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return vorgaenge.map(toVorgang);
  }

  async findOne(mandantId: string, id: string): Promise<Vorgang> {
    const vorgang = await this.prisma.vorgang.findFirst({
      where: { id, mandantId },
      include: INCLUDE,
    });
    if (!vorgang) throw new NotFoundException("Vorgang nicht gefunden.");
    return toVorgang(vorgang);
  }

  async create(mandantId: string, userId: string, dto: CreateVorgangDto): Promise<Vorgang> {
    await this.assertRefsBelongToMandant(mandantId, dto.objektId, dto.einheitId, dto.kontaktId, dto.verantwortlicherId);
    const vorgang = await this.prisma.vorgang.create({
      data: {
        titel: dto.titel,
        beschreibung: dto.beschreibung,
        status: dto.status ?? VorgangStatus.OFFEN,
        faelligkeit: dto.faelligkeit ? new Date(dto.faelligkeit) : undefined,
        objektId: dto.objektId,
        einheitId: dto.einheitId,
        kontaktId: dto.kontaktId,
        verantwortlicherId: dto.verantwortlicherId,
        mandantId,
      },
      include: INCLUDE,
    });
    await this.verlaufService.log(vorgang.id, userId, "Vorgang erstellt");
    return toVorgang(vorgang);
  }

  async update(mandantId: string, id: string, userId: string, dto: UpdateVorgangDto): Promise<Vorgang> {
    const before = await this.findOne(mandantId, id);
    await this.assertRefsBelongToMandant(mandantId, dto.objektId, dto.einheitId, dto.kontaktId, dto.verantwortlicherId);
    const vorgang = await this.prisma.vorgang.update({
      where: { id },
      data: {
        ...dto,
        faelligkeit: dto.faelligkeit ? new Date(dto.faelligkeit) : undefined,
      },
      include: INCLUDE,
    });
    const after = toVorgang(vorgang);

    for (const text of buildVerlaufEintraege(before, after, dto)) {
      await this.verlaufService.log(id, userId, text);
    }

    return after;
  }

  async remove(mandantId: string, id: string): Promise<void> {
    await this.findOne(mandantId, id);
    await this.prisma.vorgang.delete({ where: { id } });
  }

  async findVerlauf(mandantId: string, id: string) {
    await this.findOne(mandantId, id);
    return this.verlaufService.findAllForVorgang(mandantId, id);
  }

  private async assertRefsBelongToMandant(
    mandantId: string,
    objektId?: string,
    einheitId?: string,
    kontaktId?: string,
    verantwortlicherId?: string,
  ) {
    if (objektId) {
      const objekt = await this.prisma.objekt.findFirst({ where: { id: objektId, mandantId } });
      if (!objekt) throw new NotFoundException("Objekt nicht gefunden.");
    }
    if (einheitId) {
      const einheit = await this.prisma.einheit.findFirst({ where: { id: einheitId, objekt: { mandantId } } });
      if (!einheit) throw new NotFoundException("Einheit nicht gefunden.");
    }
    if (kontaktId) {
      const kontakt = await this.prisma.kontakt.findFirst({ where: { id: kontaktId, mandantId } });
      if (!kontakt) throw new NotFoundException("Kontakt nicht gefunden.");
    }
    if (verantwortlicherId) {
      const user = await this.prisma.user.findFirst({ where: { id: verantwortlicherId, mandantId } });
      if (!user) throw new NotFoundException("Verantwortlicher nicht gefunden.");
    }
  }
}

function buildVerlaufEintraege(before: Vorgang, after: Vorgang, dto: UpdateVorgangDto): string[] {
  const eintraege: string[] = [];

  if (dto.status !== undefined && before.status !== after.status) {
    eintraege.push(`Status geändert zu „${STATUS_LABEL[after.status]}“`);
  }

  if (dto.verantwortlicherId !== undefined && (before.verantwortlicher?.id ?? null) !== (after.verantwortlicher?.id ?? null)) {
    eintraege.push(after.verantwortlicher ? `Verantwortlich: ${after.verantwortlicher.name}` : "Verantwortlicher entfernt");
  }

  if (dto.faelligkeit !== undefined && before.faelligkeit !== after.faelligkeit) {
    eintraege.push(
      after.faelligkeit ? `Fälligkeit gesetzt auf ${new Date(after.faelligkeit).toLocaleDateString("de-DE")}` : "Fälligkeit entfernt",
    );
  }

  return eintraege;
}

function toVorgang(vorgang: {
  id: string;
  nummer: number;
  titel: string;
  beschreibung: string | null;
  status: string;
  faelligkeit: Date | null;
  createdAt: Date;
  objekt: { id: string; name: string } | null;
  einheit: { id: string; name: string; objekt: { id: string; name: string } } | null;
  kontakt: { id: string; vorname: string | null; nachname: string | null; firma: string | null } | null;
  verantwortlicher: { id: string; name: string } | null;
  labels: { label: { id: string; name: string; farbe: string } }[];
}): Vorgang {
  return {
    id: vorgang.id,
    nummer: vorgang.nummer,
    titel: vorgang.titel,
    beschreibung: vorgang.beschreibung,
    status: vorgang.status as Vorgang["status"],
    faelligkeit: vorgang.faelligkeit ? vorgang.faelligkeit.toISOString() : null,
    createdAt: vorgang.createdAt.toISOString(),
    objekt: vorgang.objekt,
    einheit: vorgang.einheit,
    kontakt: vorgang.kontakt,
    verantwortlicher: vorgang.verantwortlicher,
    labels: vorgang.labels.map((l) => l.label),
  };
}
