import { Injectable } from "@nestjs/common";
import { VorgangVerlaufEintrag } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class VerlaufService {
  constructor(private readonly prisma: PrismaService) {}

  async log(vorgangId: string, autorId: string, text: string): Promise<void> {
    await this.prisma.vorgangVerlauf.create({ data: { vorgangId, autorId, text } });
  }

  async findAllForVorgang(mandantId: string, vorgangId: string): Promise<VorgangVerlaufEintrag[]> {
    const eintraege = await this.prisma.vorgangVerlauf.findMany({
      where: { vorgangId, vorgang: { mandantId } },
      include: { autor: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return eintraege.map((e) => ({
      id: e.id,
      text: e.text,
      createdAt: e.createdAt.toISOString(),
      autor: e.autor,
    }));
  }
}
