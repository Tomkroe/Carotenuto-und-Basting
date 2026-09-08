import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { DokumentKategorie } from "@maklerprogram/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { DokumentKategorienService } from "./dokument-kategorien.service";
import { CreateDokumentKategorieDto } from "./dto/create-dokument-kategorie.dto";
import { UpdateDokumentKategorieDto } from "./dto/update-dokument-kategorie.dto";

@Controller("dokument-kategorien")
@UseGuards(JwtAuthGuard)
export class DokumentKategorienController {
  constructor(private readonly dokumentKategorienService: DokumentKategorienService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload): Promise<DokumentKategorie[]> {
    return this.dokumentKategorienService.findAll(user.mandantId);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateDokumentKategorieDto): Promise<DokumentKategorie> {
    return this.dokumentKategorienService.create(user.mandantId, dto);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: UpdateDokumentKategorieDto,
  ): Promise<DokumentKategorie> {
    return this.dokumentKategorienService.update(user.mandantId, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<void> {
    return this.dokumentKategorienService.remove(user.mandantId, id);
  }
}
