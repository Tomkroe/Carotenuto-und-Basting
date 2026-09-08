import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Label } from "@maklerprogram/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { LabelsService } from "./labels.service";
import { CreateLabelDto } from "./dto/create-label.dto";
import { UpdateLabelDto } from "./dto/update-label.dto";

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

  @Patch(":id")
  update(@CurrentUser() user: JwtPayload, @Param("id") id: string, @Body() dto: UpdateLabelDto): Promise<Label> {
    return this.labelsService.update(user.mandantId, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<void> {
    return this.labelsService.remove(user.mandantId, id);
  }
}
