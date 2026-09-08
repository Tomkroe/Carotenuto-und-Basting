import { Injectable, NotFoundException } from "@nestjs/common";
import { DokumentKategorie } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDokumentKategorieDto } from "./dto/create-dokument-kategorie.dto";
import { UpdateDokumentKategorieDto } from "./dto/update-dokument-kategorie.dto";

@Injectable()
export class DokumentKategorienService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(mandantId: string): Promise<DokumentKategorie[]> {
    const kategorien = await this.prisma.dokumentKategorie.findMany({
      where: { mandantId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, _count: { select: { dokumente: true } } },
    });
    return kategorien.map(({ _count, ...k }) => ({ ...k, dokumentCount: _count.dokumente }));
  }

  async create(mandantId: string, dto: CreateDokumentKategorieDto): Promise<DokumentKategorie> {
    return this.prisma.dokumentKategorie.create({
      data: { ...dto, mandantId },
      select: { id: true, name: true },
    });
  }

  async update(mandantId: string, id: string, dto: UpdateDokumentKategorieDto): Promise<DokumentKategorie> {
    const existing = await this.prisma.dokumentKategorie.findFirst({ where: { id, mandantId } });
    if (!existing) throw new NotFoundException("Kategorie nicht gefunden.");
    return this.prisma.dokumentKategorie.update({
      where: { id },
      data: dto,
      select: { id: true, name: true },
    });
  }

  async remove(mandantId: string, id: string): Promise<void> {
    const existing = await this.prisma.dokumentKategorie.findFirst({ where: { id, mandantId } });
    if (!existing) throw new NotFoundException("Kategorie nicht gefunden.");
    await this.prisma.dokumentKategorie.delete({ where: { id } });
  }
}
