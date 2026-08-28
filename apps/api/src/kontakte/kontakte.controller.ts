import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Kontakt, KontaktObjektZuordnung } from "@maklerprogram/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { KontakteService } from "./kontakte.service";
import { CreateKontaktDto } from "./dto/create-kontakt.dto";
import { UpdateKontaktDto } from "./dto/update-kontakt.dto";

@Controller("kontakte")
@UseGuards(JwtAuthGuard)
export class KontakteController {
  constructor(private readonly kontakteService: KontakteService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload): Promise<Kontakt[]> {
    return this.kontakteService.findAll(user.mandantId);
  }

  @Get(":id")
  findOne(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<Kontakt> {
    return this.kontakteService.findOne(user.mandantId, id);
  }

  @Get(":id/objekte")
  findObjekte(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<KontaktObjektZuordnung[]> {
    return this.kontakteService.findObjekte(user.mandantId, id);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateKontaktDto): Promise<Kontakt> {
    return this.kontakteService.create(user.mandantId, dto);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: UpdateKontaktDto,
  ): Promise<Kontakt> {
    return this.kontakteService.update(user.mandantId, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<void> {
    return this.kontakteService.remove(user.mandantId, id);
  }
}
