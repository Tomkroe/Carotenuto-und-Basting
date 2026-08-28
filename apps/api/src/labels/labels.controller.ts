import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from "@nestjs/common";
import { Label } from "@maklerprogram/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { LabelsService } from "./labels.service";
import { CreateLabelDto } from "./dto/create-label.dto";

@Controller("labels")
@UseGuards(JwtAuthGuard)
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload): Promise<Label[]> {
    return this.labelsService.findAll(user.mandantId);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateLabelDto): Promise<Label> {
    return this.labelsService.create(user.mandantId, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<void> {
    return this.labelsService.remove(user.mandantId, id);
  }
}
