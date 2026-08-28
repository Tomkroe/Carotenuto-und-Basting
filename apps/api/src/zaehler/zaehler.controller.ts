import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Zaehler } from "@maklerprogram/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { ZaehlerService } from "./zaehler.service";
import { CreateZaehlerDto } from "./dto/create-zaehler.dto";
import { UpdateZaehlerDto } from "./dto/update-zaehler.dto";

@Controller("zaehler")
@UseGuards(JwtAuthGuard)
export class ZaehlerController {
  constructor(private readonly zaehlerService: ZaehlerService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload): Promise<Zaehler[]> {
    return this.zaehlerService.findAll(user.mandantId);
  }

  @Get(":id")
  findOne(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<Zaehler> {
    return this.zaehlerService.findOne(user.mandantId, id);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateZaehlerDto): Promise<Zaehler> {
    return this.zaehlerService.create(user.mandantId, dto);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: UpdateZaehlerDto,
  ): Promise<Zaehler> {
    return this.zaehlerService.update(user.mandantId, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<void> {
    return this.zaehlerService.remove(user.mandantId, id);
  }
}
