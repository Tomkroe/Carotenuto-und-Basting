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
  Redirect,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Dokument, DokumentMitZuordnung } from "@maklerprogram/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { DokumenteService } from "./dokumente.service";
import { UpdateDokumentDto } from "./dto/update-dokument.dto";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_FILE_SIZE = 25 * 1024 * 1024;

const UPLOAD_INTERCEPTOR = FileInterceptor("file", {
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(new BadRequestException("Dateityp nicht erlaubt."), false);
      return;
    }
    callback(null, true);
  },
});

@Controller("objekte/:objektId/dokumente")
@UseGuards(JwtAuthGuard)
export class ObjektDokumenteController {
  constructor(private readonly dokumenteService: DokumenteService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Param("objektId") objektId: string): Promise<Dokument[]> {
    return this.dokumenteService.findAllForObjekt(user.mandantId, objektId);
  }

  @Post()
  @UseInterceptors(UPLOAD_INTERCEPTOR)
  upload(
    @CurrentUser() user: JwtPayload,
    @Param("objektId") objektId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Dokument> {
    if (!file) throw new BadRequestException("Keine Datei übermittelt.");
    return this.dokumenteService.uploadForObjekt(user.mandantId, objektId, user.sub, file);
  }
}

@Controller("vorgaenge/:vorgangId/dokumente")
@UseGuards(JwtAuthGuard)
export class VorgangDokumenteController {
  constructor(private readonly dokumenteService: DokumenteService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Param("vorgangId") vorgangId: string): Promise<Dokument[]> {
    return this.dokumenteService.findAllForVorgang(user.mandantId, vorgangId);
  }

  @Post()
  @UseInterceptors(UPLOAD_INTERCEPTOR)
  upload(
    @CurrentUser() user: JwtPayload,
    @Param("vorgangId") vorgangId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Dokument> {
    if (!file) throw new BadRequestException("Keine Datei übermittelt.");
    return this.dokumenteService.uploadForVorgang(user.mandantId, vorgangId, user.sub, file);
  }
}

@Controller("mietvertraege/:mietvertragId/dokumente")
@UseGuards(JwtAuthGuard)
export class MietvertragDokumenteController {
  constructor(private readonly dokumenteService: DokumenteService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Param("mietvertragId") mietvertragId: string): Promise<Dokument[]> {
    return this.dokumenteService.findAllForMietvertrag(user.mandantId, mietvertragId);
  }

  @Post()
  @UseInterceptors(UPLOAD_INTERCEPTOR)
  upload(
    @CurrentUser() user: JwtPayload,
    @Param("mietvertragId") mietvertragId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Dokument> {
    if (!file) throw new BadRequestException("Keine Datei übermittelt.");
    return this.dokumenteService.uploadForMietvertrag(user.mandantId, mietvertragId, user.sub, file);
  }
}

@Controller("nebenkostenabrechnungen/:nebenkostenabrechnungId/dokumente")
@UseGuards(JwtAuthGuard)
export class NebenkostenabrechnungDokumenteController {
  constructor(private readonly dokumenteService: DokumenteService) {}

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Param("nebenkostenabrechnungId") nebenkostenabrechnungId: string,
  ): Promise<Dokument[]> {
    return this.dokumenteService.findAllForNebenkostenabrechnung(user.mandantId, nebenkostenabrechnungId);
  }

  @Post()
  @UseInterceptors(UPLOAD_INTERCEPTOR)
  upload(
    @CurrentUser() user: JwtPayload,
    @Param("nebenkostenabrechnungId") nebenkostenabrechnungId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Dokument> {
    if (!file) throw new BadRequestException("Keine Datei übermittelt.");
    return this.dokumenteService.uploadForNebenkostenabrechnung(
      user.mandantId,
      nebenkostenabrechnungId,
      user.sub,
      file,
    );
  }
}

@Controller("kontakte/:kontaktId/dokumente")
@UseGuards(JwtAuthGuard)
export class KontaktDokumenteController {
  constructor(private readonly dokumenteService: DokumenteService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Param("kontaktId") kontaktId: string): Promise<Dokument[]> {
    return this.dokumenteService.findAllForKontakt(user.mandantId, kontaktId);
  }

  @Post()
  @UseInterceptors(UPLOAD_INTERCEPTOR)
  upload(
    @CurrentUser() user: JwtPayload,
    @Param("kontaktId") kontaktId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Dokument> {
    if (!file) throw new BadRequestException("Keine Datei übermittelt.");
    return this.dokumenteService.uploadForKontakt(user.mandantId, kontaktId, user.sub, file);
  }
}

@Controller("dokumente")
@UseGuards(JwtAuthGuard)
export class DokumenteController {
  constructor(private readonly dokumenteService: DokumenteService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload): Promise<DokumentMitZuordnung[]> {
    return this.dokumenteService.findAllForMandant(user.mandantId);
  }

  @Get(":id/download")
  @Redirect()
  async download(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    const url = await this.dokumenteService.getDownloadUrl(user.mandantId, id);
    return { url, statusCode: HttpStatus.FOUND };
  }

  @Patch(":id")
  update(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: UpdateDokumentDto,
  ): Promise<Dokument> {
    return this.dokumenteService.update(user.mandantId, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<void> {
    return this.dokumenteService.remove(user.mandantId, id);
  }
}
