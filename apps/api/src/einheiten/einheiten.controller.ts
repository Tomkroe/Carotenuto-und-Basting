import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Einheit, EinheitListItem } from "@maklerprogram/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { EinheitenService } from "./einheiten.service";
import { CreateEinheitDto } from "./dto/create-einheit.dto";
import { UpdateEinheitDto } from "./dto/update-einheit.dto";

@Controller("objekte/:objektId/einheiten")
@UseGuards(JwtAuthGuard)
export class ObjektEinheitenController {
  constructor(private readonly einheitenService: EinheitenService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Param("objektId") objektId: string): Promise<Einheit[]> {
    return this.einheitenService.findAllForObjekt(user.mandantId, objektId);
  }

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Param("objektId") objektId: string,
    @Body() dto: CreateEinheitDto,
  ): Promise<Einheit> {
    return this.einheitenService.create(user.mandantId, objektId, dto);
  }
}

@Controller("einheiten")
@UseGuards(JwtAuthGuard)
export class EinheitenController {
  constructor(private readonly einheitenService: EinheitenService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload): Promise<EinheitListItem[]> {
    return this.einheitenService.findAllForMandant(user.mandantId);
  }

  @Get(":id")
  findOne(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<Einheit> {
    return this.einheitenService.findOne(user.mandantId, id);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: UpdateEinheitDto,
  ): Promise<Einheit> {
    return this.einheitenService.update(user.mandantId, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<void> {
    return this.einheitenService.remove(user.mandantId, id);
  }
}
