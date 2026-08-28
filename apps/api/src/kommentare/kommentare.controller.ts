import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { Kommentar } from "@maklerprogram/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { KommentareService } from "./kommentare.service";
import { CreateKommentarDto } from "./dto/create-kommentar.dto";

@Controller("vorgaenge/:vorgangId/kommentare")
@UseGuards(JwtAuthGuard)
export class KommentareController {
  constructor(private readonly kommentareService: KommentareService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Param("vorgangId") vorgangId: string): Promise<Kommentar[]> {
    return this.kommentareService.findAllForVorgang(user.mandantId, vorgangId);
  }

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Param("vorgangId") vorgangId: string,
    @Body() dto: CreateKommentarDto,
  ): Promise<Kommentar> {
    return this.kommentareService.create(user.mandantId, vorgangId, user.sub, dto);
  }
}
