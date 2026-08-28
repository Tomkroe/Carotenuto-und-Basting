import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from "@nestjs/common";
import { NebenkostenPosition } from "@maklerprogram/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { NebenkostenpositionenService } from "./nebenkostenpositionen.service";
import { CreateNebenkostenPositionDto } from "./dto/create-nebenkostenposition.dto";

@Controller("nebenkostenabrechnungen/:nebenkostenabrechnungId/positionen")
@UseGuards(JwtAuthGuard)
export class AbrechnungPositionenController {
  constructor(private readonly nebenkostenpositionenService: NebenkostenpositionenService) {}

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Param("nebenkostenabrechnungId") nebenkostenabrechnungId: string,
  ): Promise<NebenkostenPosition[]> {
    return this.nebenkostenpositionenService.findAllForAbrechnung(user.mandantId, nebenkostenabrechnungId);
  }

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Param("nebenkostenabrechnungId") nebenkostenabrechnungId: string,
    @Body() dto: CreateNebenkostenPositionDto,
  ): Promise<NebenkostenPosition> {
    return this.nebenkostenpositionenService.create(user.mandantId, nebenkostenabrechnungId, dto);
  }
}

@Controller("positionen")
@UseGuards(JwtAuthGuard)
export class PositionenController {
  constructor(private readonly nebenkostenpositionenService: NebenkostenpositionenService) {}

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<void> {
    return this.nebenkostenpositionenService.remove(user.mandantId, id);
  }
}
