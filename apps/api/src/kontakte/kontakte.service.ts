import { Injectable, NotFoundException } from "@nestjs/common";
import { Kontakt, KontaktObjektZuordnung } from "@maklerprogram/types";
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

  async findObjekte(mandantId: string, id: string): Promise<KontaktObjektZuordnung[]> {
    await this.findOne(mandantId, id);

    const einheitInclude = { einheit: { include: { objekt: { select: { id: true, name: true } } } } } as const;

    const [mietvertraege, eigentuemerschaften] = await Promise.all([
      this.prisma.mietvertrag.findMany({ where: { mieterId: id }, include: einheitInclude }),
      this.prisma.eigentuemerschaft.findMany({ where: { eigentuemerId: id }, include: einheitInclude }),
    ]);

    const zuordnungen: KontaktObjektZuordnung[] = [
      ...mietvertraege.map((m) => ({
        rolle: "MIETER" as const,
        einheit: { id: m.einheit.id, name: m.einheit.name, objekt: m.einheit.objekt },
        mietvertragStatus: m.status as KontaktObjektZuordnung["mietvertragStatus"],
      })),
      ...eigentuemerschaften.map((e) => ({
        rolle: "EIGENTUEMER" as const,
        einheit: { id: e.einheit.id, name: e.einheit.name, objekt: e.einheit.objekt },
        mietvertragStatus: null,
      })),
    ];

    return zuordnungen;
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
  debitorNr: string | null;
  kreditorNr: string | null;
  geburtsdatum: Date | null;
  adresseStrasse: string | null;
  adresseHausnummer: string | null;
  adressePlz: string | null;
  adresseOrt: string | null;
  notizen: string | null;
  bankKontoinhaber: string | null;
  bankName: string | null;
  bankIban: string | null;
  bankBic: string | null;
  bankGlaeubigerId: string | null;
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
    debitorNr: kontakt.debitorNr,
    kreditorNr: kontakt.kreditorNr,
    geburtsdatum: kontakt.geburtsdatum != null ? kontakt.geburtsdatum.toISOString() : null,
    adresseStrasse: kontakt.adresseStrasse,
    adresseHausnummer: kontakt.adresseHausnummer,
    adressePlz: kontakt.adressePlz,
    adresseOrt: kontakt.adresseOrt,
    notizen: kontakt.notizen,
    bankKontoinhaber: kontakt.bankKontoinhaber,
    bankName: kontakt.bankName,
    bankIban: kontakt.bankIban,
    bankBic: kontakt.bankBic,
    bankGlaeubigerId: kontakt.bankGlaeubigerId,
    createdAt: kontakt.createdAt.toISOString(),
  };
}
