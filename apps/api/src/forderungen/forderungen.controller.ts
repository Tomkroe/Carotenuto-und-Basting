import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { Forderung, ForderungStatusWert } from "@maklerprogram/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { ForderungenService } from "./forderungen.service";
import { MarkForderungDto } from "./dto/mark-forderung.dto";

@Controller("forderungen")
@UseGuards(JwtAuthGuard)
export class ForderungenController {
  constructor(private readonly forderungenService: ForderungenService) {}

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query("von") von?: string,
    @Query("bis") bis?: string,
    @Query("objektId") objektId?: string,
    @Query("status") status?: ForderungStatusWert,
  ): Promise<Forderung[]> {
    return this.forderungenService.findAll(user.mandantId, { von, bis, objektId, status });
  }

  @Post("markieren")
  markieren(@CurrentUser() user: JwtPayload, @Body() dto: MarkForderungDto): Promise<void> {
    return this.forderungenService.markStatus(user.mandantId, dto);
  }
}
