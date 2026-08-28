import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Objekt } from "@maklerprogram/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { ObjekteService } from "./objekte.service";
import { CreateObjektDto } from "./dto/create-objekt.dto";
import { UpdateObjektDto } from "./dto/update-objekt.dto";

@Controller("objekte")
@UseGuards(JwtAuthGuard)
export class ObjekteController {
  constructor(private readonly objekteService: ObjekteService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload): Promise<Objekt[]> {
    return this.objekteService.findAll(user.mandantId);
  }

  @Get(":id")
  findOne(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<Objekt> {
    return this.objekteService.findOne(user.mandantId, id);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateObjektDto): Promise<Objekt> {
    return this.objekteService.create(user.mandantId, dto);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: UpdateObjektDto,
  ): Promise<Objekt> {
    return this.objekteService.update(user.mandantId, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<void> {
    return this.objekteService.remove(user.mandantId, id);
  }
}
