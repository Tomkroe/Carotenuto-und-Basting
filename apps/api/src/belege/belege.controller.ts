import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { Beleg, BelegStatus } from "@maklerprogram/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { BelegeService } from "./belege.service";
import { CreateBelegDto } from "./dto/create-beleg.dto";
import { UpdateBelegDto } from "./dto/update-beleg.dto";

@Controller("belege")
@UseGuards(JwtAuthGuard)
export class BelegeController {
  constructor(private readonly belegeService: BelegeService) {}

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query("objektId") objektId?: string,
    @Query("status") status?: BelegStatus,
    @Query("von") von?: string,
    @Query("bis") bis?: string,
  ): Promise<Beleg[]> {
    return this.belegeService.findAll(user.mandantId, { objektId, status, von, bis });
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateBelegDto): Promise<Beleg> {
    return this.belegeService.create(user.mandantId, dto);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: UpdateBelegDto,
  ): Promise<Beleg> {
    return this.belegeService.update(user.mandantId, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<void> {
    return this.belegeService.remove(user.mandantId, id);
  }
}
