import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Mietvertrag } from "@maklerprogram/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { MietvertraegeService } from "./mietvertraege.service";
import { CreateMietvertragDto } from "./dto/create-mietvertrag.dto";
import { UpdateMietvertragDto } from "./dto/update-mietvertrag.dto";

@Controller("mietvertraege")
@UseGuards(JwtAuthGuard)
export class MietvertraegeController {
  constructor(private readonly mietvertraegeService: MietvertraegeService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload): Promise<Mietvertrag[]> {
    return this.mietvertraegeService.findAll(user.mandantId);
  }

  @Get(":id")
  findOne(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<Mietvertrag> {
    return this.mietvertraegeService.findOne(user.mandantId, id);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateMietvertragDto): Promise<Mietvertrag> {
    return this.mietvertraegeService.create(user.mandantId, dto);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: UpdateMietvertragDto,
  ): Promise<Mietvertrag> {
    return this.mietvertraegeService.update(user.mandantId, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<void> {
    return this.mietvertraegeService.remove(user.mandantId, id);
  }
}
