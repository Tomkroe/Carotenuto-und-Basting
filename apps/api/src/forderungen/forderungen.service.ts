import { Injectable, NotFoundException } from "@nestjs/common";
import { Forderung, ForderungStatusWert, ForderungTyp } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { MarkForderungDto } from "./dto/mark-forderung.dto";

const MONATE = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

interface FindAllParams {
  von?: string;
  bis?: string;
  objektId?: string;
  status?: ForderungStatusWert;
}

const MIETVERTRAG_INCLUDE = {
  einheit: { select: { id: true, name: true, objektId: true, objekt: { select: { id: true, name: true } } } },
  mieter: { select: { id: true, vorname: true, nachname: true, firma: true } },
} as const;

@Injectable()
export class ForderungenService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(mandantId: string, params: FindAllParams): Promise<Forderung[]> {
    const now = new Date();
    const von = params.von ? new Date(params.von) : new Date(now.getFullYear(), 0, 1);
    const bis = params.bis ? new Date(params.bis) : new Date(now.getFullYear(), 11, 31);

    const mietvertraege = await this.prisma.mietvertrag.findMany({
      where: {
        einheit: { objekt: { mandantId, ...(params.objektId ? { id: params.objektId } : {}) } },
        status: { in: ["AKTIV", "BEENDET"] },
        beginn: { lte: bis },
        OR: [{ ende: null }, { ende: { gte: von } }],
      },
      include: MIETVERTRAG_INCLUDE,
    });

    const statusRows = await this.prisma.forderungStatus.findMany({
      where: { mietvertragId: { in: mietvertraege.map((m) => m.id) } },
    });
    const statusMap = new Map(statusRows.map((s) => [`${s.mietvertragId}:${s.typ}:${s.periode}`, s.status]));

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const forderungen: Forderung[] = [];

    for (const mv of mietvertraege) {
      const mieter = mv.mieter;
      const objekt = mv.einheit.objekt;
      const einheit = { id: mv.einheit.id, name: mv.einheit.name };
      const betragMiete = Number(mv.kaltmiete) + Number(mv.nebenkostenVorauszahlung);

      const startMonthIndex = Math.max(
        von.getFullYear() * 12 + von.getMonth(),
        new Date(mv.beginn).getFullYear() * 12 + new Date(mv.beginn).getMonth(),
      );
      const vertragsEndeMonthIndex = mv.ende
        ? new Date(mv.ende).getFullYear() * 12 + new Date(mv.ende).getMonth()
        : Infinity;
      const endMonthIndex = Math.min(bis.getFullYear() * 12 + bis.getMonth(), vertragsEndeMonthIndex);

      for (let m = startMonthIndex; m <= endMonthIndex; m++) {
        const year = Math.floor(m / 12);
        const monthIdx = m % 12;
        const faelligkeitsdatum = new Date(year, monthIdx, 3);
        const periode = `${year}-${String(monthIdx + 1).padStart(2, "0")}`;
        const key = `${mv.id}:${ForderungTyp.MIETE}:${periode}`;
        const override = statusMap.get(key);
        const status = override ?? (faelligkeitsdatum < today ? ForderungStatusWert.UEBERFAELLIG : ForderungStatusWert.OFFEN);

        forderungen.push({
          mietvertragId: mv.id,
          typ: ForderungTyp.MIETE,
          periode,
          zweck: `Miete ${MONATE[monthIdx]} ${year}`,
          faelligkeitsdatum: faelligkeitsdatum.toISOString(),
          betrag: betragMiete,
          status: status as ForderungStatusWert,
          objekt,
          einheit,
          mieter,
        });
      }

      if (mv.kaution && Number(mv.kaution) > 0) {
        // Kaution ist einmalig, nicht periodenbezogen wie die Miete — sie soll unabhängig
        // vom gewählten Zeitraum sichtbar bleiben, solange sie nicht als bezahlt/verloren markiert ist.
        const beginn = new Date(mv.beginn);
        const key = `${mv.id}:${ForderungTyp.KAUTION}:EINMALIG`;
        const override = statusMap.get(key);
        const status = override ?? (beginn < today ? ForderungStatusWert.UEBERFAELLIG : ForderungStatusWert.OFFEN);
        forderungen.push({
          mietvertragId: mv.id,
          typ: ForderungTyp.KAUTION,
          periode: "EINMALIG",
          zweck: "Kaution",
          faelligkeitsdatum: beginn.toISOString(),
          betrag: Number(mv.kaution),
          status: status as ForderungStatusWert,
          objekt,
          einheit,
          mieter,
        });
      }
    }

    const filtered = params.status ? forderungen.filter((f) => f.status === params.status) : forderungen;
    filtered.sort((a, b) => a.faelligkeitsdatum.localeCompare(b.faelligkeitsdatum));
    return filtered;
  }

  async markStatus(mandantId: string, dto: MarkForderungDto): Promise<void> {
    const mietvertrag = await this.prisma.mietvertrag.findFirst({
      where: { id: dto.mietvertragId, einheit: { objekt: { mandantId } } },
    });
    if (!mietvertrag) throw new NotFoundException("Mietvertrag nicht gefunden.");

    if (dto.status === "OFFEN") {
      await this.prisma.forderungStatus.deleteMany({
        where: { mietvertragId: dto.mietvertragId, typ: dto.typ, periode: dto.periode },
      });
      return;
    }

    await this.prisma.forderungStatus.upsert({
      where: { mietvertragId_typ_periode: { mietvertragId: dto.mietvertragId, typ: dto.typ, periode: dto.periode } },
      create: { mietvertragId: dto.mietvertragId, typ: dto.typ, periode: dto.periode, status: dto.status },
      update: { status: dto.status },
    });
  }
}
