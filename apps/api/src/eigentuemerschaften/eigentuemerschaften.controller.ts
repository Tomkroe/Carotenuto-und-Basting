import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Eigentuemerschaft } from "@maklerprogram/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { EigentuemerschaftenService } from "./eigentuemerschaften.service";
import { CreateEigentuemerschaftDto } from "./dto/create-eigentuemerschaft.dto";
import { UpdateEigentuemerschaftDto } from "./dto/update-eigentuemerschaft.dto";

@Controller("eigentuemerschaften")
@UseGuards(JwtAuthGuard)
export class EigentuemerschaftenController {
  constructor(private readonly eigentuemerschaftenService: EigentuemerschaftenService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload): Promise<Eigentuemerschaft[]> {
    return this.eigentuemerschaftenService.findAll(user.mandantId);
  }

  @Get(":id")
  findOne(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<Eigentuemerschaft> {
    return this.eigentuemerschaftenService.findOne(user.mandantId, id);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateEigentuemerschaftDto): Promise<Eigentuemerschaft> {
    return this.eigentuemerschaftenService.create(user.mandantId, dto);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: UpdateEigentuemerschaftDto,
  ): Promise<Eigentuemerschaft> {
    return this.eigentuemerschaftenService.update(user.mandantId, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<void> {
    return this.eigentuemerschaftenService.remove(user.mandantId, id);
  }
}
