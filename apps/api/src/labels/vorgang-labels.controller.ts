import { Controller, Delete, HttpCode, HttpStatus, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { VorgangLabelsService } from "./vorgang-labels.service";

@Controller("vorgaenge/:vorgangId/labels")
@UseGuards(JwtAuthGuard)
export class VorgangLabelsController {
  constructor(private readonly vorgangLabelsService: VorgangLabelsService) {}

  @Post(":labelId")
  @HttpCode(HttpStatus.NO_CONTENT)
  attach(
    @CurrentUser() user: JwtPayload,
    @Param("vorgangId") vorgangId: string,
    @Param("labelId") labelId: string,
  ): Promise<void> {
    return this.vorgangLabelsService.attach(user.mandantId, user.sub, vorgangId, labelId);
  }

  @Delete(":labelId")
  @HttpCode(HttpStatus.NO_CONTENT)
  detach(
    @CurrentUser() user: JwtPayload,
    @Param("vorgangId") vorgangId: string,
    @Param("labelId") labelId: string,
  ): Promise<void> {
    return this.vorgangLabelsService.detach(user.mandantId, user.sub, vorgangId, labelId);
  }
}
