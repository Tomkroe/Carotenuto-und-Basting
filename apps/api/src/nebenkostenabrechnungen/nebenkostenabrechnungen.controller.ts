import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Nebenkostenabrechnung } from "@maklerprogram/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { NebenkostenabrechnungenService } from "./nebenkostenabrechnungen.service";
import { CreateNebenkostenabrechnungDto } from "./dto/create-nebenkostenabrechnung.dto";
import { UpdateNebenkostenabrechnungDto } from "./dto/update-nebenkostenabrechnung.dto";

@Controller("nebenkostenabrechnungen")
@UseGuards(JwtAuthGuard)
export class NebenkostenabrechnungenController {
  constructor(private readonly nebenkostenabrechnungenService: NebenkostenabrechnungenService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload): Promise<Nebenkostenabrechnung[]> {
    return this.nebenkostenabrechnungenService.findAll(user.mandantId);
  }

  @Get(":id")
  findOne(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<Nebenkostenabrechnung> {
    return this.nebenkostenabrechnungenService.findOne(user.mandantId, id);
  }

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateNebenkostenabrechnungDto,
  ): Promise<Nebenkostenabrechnung> {
    return this.nebenkostenabrechnungenService.create(user.mandantId, dto);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: UpdateNebenkostenabrechnungDto,
  ): Promise<Nebenkostenabrechnung> {
    return this.nebenkostenabrechnungenService.update(user.mandantId, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<void> {
    return this.nebenkostenabrechnungenService.remove(user.mandantId, id);
  }
}
