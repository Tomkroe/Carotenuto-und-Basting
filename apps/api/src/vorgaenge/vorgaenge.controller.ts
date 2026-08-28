import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Vorgang } from "@maklerprogram/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { VorgaengeService } from "./vorgaenge.service";
import { CreateVorgangDto } from "./dto/create-vorgang.dto";
import { UpdateVorgangDto } from "./dto/update-vorgang.dto";

@Controller("vorgaenge")
@UseGuards(JwtAuthGuard)
export class VorgaengeController {
  constructor(private readonly vorgaengeService: VorgaengeService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload): Promise<Vorgang[]> {
    return this.vorgaengeService.findAll(user.mandantId);
  }

  @Get(":id")
  findOne(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<Vorgang> {
    return this.vorgaengeService.findOne(user.mandantId, id);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateVorgangDto): Promise<Vorgang> {
    return this.vorgaengeService.create(user.mandantId, dto);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: UpdateVorgangDto,
  ): Promise<Vorgang> {
    return this.vorgaengeService.update(user.mandantId, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<void> {
    return this.vorgaengeService.remove(user.mandantId, id);
  }
}
