import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Redirect,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Dokument } from "@maklerprogram/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { DokumenteService } from "./dokumente.service";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_FILE_SIZE = 25 * 1024 * 1024;

@Controller("mietvertraege/:mietvertragId/dokumente")
@UseGuards(JwtAuthGuard)
export class MietvertragDokumenteController {
  constructor(private readonly dokumenteService: DokumenteService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Param("mietvertragId") mietvertragId: string): Promise<Dokument[]> {
    return this.dokumenteService.findAllForMietvertrag(user.mandantId, mietvertragId);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
          callback(new BadRequestException("Dateityp nicht erlaubt."), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  upload(
    @CurrentUser() user: JwtPayload,
    @Param("mietvertragId") mietvertragId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Dokument> {
    if (!file) throw new BadRequestException("Keine Datei übermittelt.");
    return this.dokumenteService.uploadForMietvertrag(user.mandantId, mietvertragId, user.sub, file);
  }
}

@Controller("dokumente")
@UseGuards(JwtAuthGuard)
export class DokumenteController {
  constructor(private readonly dokumenteService: DokumenteService) {}

  @Get(":id/download")
  @Redirect()
  async download(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    const url = await this.dokumenteService.getDownloadUrl(user.mandantId, id);
    return { url, statusCode: HttpStatus.FOUND };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<void> {
    return this.dokumenteService.remove(user.mandantId, id);
  }
}
