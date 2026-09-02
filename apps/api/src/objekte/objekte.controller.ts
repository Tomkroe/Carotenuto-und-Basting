import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Objekt } from "@maklerprogram/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { ObjekteService } from "./objekte.service";
import { CreateObjektDto } from "./dto/create-objekt.dto";
import { UpdateObjektDto } from "./dto/update-objekt.dto";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const TITELBILD_INTERCEPTOR = FileInterceptor("file", {
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      callback(new BadRequestException("Nur JPEG, PNG oder WebP erlaubt."), false);
      return;
    }
    callback(null, true);
  },
});

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

  @Post(":id/titelbild")
  @UseInterceptors(TITELBILD_INTERCEPTOR)
  uploadTitelbild(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Objekt> {
    if (!file) throw new BadRequestException("Keine Datei übermittelt.");
    return this.objekteService.uploadTitelbild(user.mandantId, id, file);
  }

  @Delete(":id/titelbild")
  removeTitelbild(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<Objekt> {
    return this.objekteService.removeTitelbild(user.mandantId, id);
  }
}
