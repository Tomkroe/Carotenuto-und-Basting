import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { VorgangVorlage } from "@maklerprogram/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { VorgangVorlagenService } from "./vorgang-vorlagen.service";
import { CreateVorgangVorlageDto } from "./dto/create-vorgang-vorlage.dto";
import { UpdateVorgangVorlageDto } from "./dto/update-vorgang-vorlage.dto";

@Controller("vorgang-vorlagen")
@UseGuards(JwtAuthGuard)
export class VorgangVorlagenController {
  constructor(private readonly vorgangVorlagenService: VorgangVorlagenService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload): Promise<VorgangVorlage[]> {
    return this.vorgangVorlagenService.findAll(user.mandantId);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateVorgangVorlageDto): Promise<VorgangVorlage> {
    return this.vorgangVorlagenService.create(user.mandantId, dto);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: UpdateVorgangVorlageDto,
  ): Promise<VorgangVorlage> {
    return this.vorgangVorlagenService.update(user.mandantId, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<void> {
    return this.vorgangVorlagenService.remove(user.mandantId, id);
  }
}
