import { Module } from "@nestjs/common";
import { StorageModule } from "../storage/storage.module";
import {
  MietvertragDokumenteController,
  ObjektDokumenteController,
  VorgangDokumenteController,
  NebenkostenabrechnungDokumenteController,
  KontaktDokumenteController,
  DokumenteController,
} from "./dokumente.controller";
import { DokumenteService } from "./dokumente.service";

@Module({
  imports: [StorageModule],
  controllers: [
    MietvertragDokumenteController,
    ObjektDokumenteController,
    VorgangDokumenteController,
    NebenkostenabrechnungDokumenteController,
    KontaktDokumenteController,
    DokumenteController,
  ],
  providers: [DokumenteService],
  exports: [DokumenteService],
})
export class DokumenteModule {}
