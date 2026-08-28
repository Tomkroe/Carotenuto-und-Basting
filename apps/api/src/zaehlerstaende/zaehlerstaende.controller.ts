import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from "@nestjs/common";
import { Zaehlerstand } from "@maklerprogram/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { ZaehlerstaendeService } from "./zaehlerstaende.service";
import { CreateZaehlerstandDto } from "./dto/create-zaehlerstand.dto";

@Controller("zaehler/:zaehlerId/zaehlerstaende")
@UseGuards(JwtAuthGuard)
export class ZaehlerZaehlerstaendeController {
  constructor(private readonly zaehlerstaendeService: ZaehlerstaendeService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Param("zaehlerId") zaehlerId: string): Promise<Zaehlerstand[]> {
    return this.zaehlerstaendeService.findAllForZaehler(user.mandantId, zaehlerId);
  }

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Param("zaehlerId") zaehlerId: string,
    @Body() dto: CreateZaehlerstandDto,
  ): Promise<Zaehlerstand> {
    return this.zaehlerstaendeService.create(user.mandantId, zaehlerId, dto);
  }
}

@Controller("zaehlerstaende")
@UseGuards(JwtAuthGuard)
export class ZaehlerstaendeController {
  constructor(private readonly zaehlerstaendeService: ZaehlerstaendeService) {}

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<void> {
    return this.zaehlerstaendeService.remove(user.mandantId, id);
  }
}
