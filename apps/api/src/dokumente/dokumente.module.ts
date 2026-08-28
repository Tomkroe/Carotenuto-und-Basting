import { Module } from "@nestjs/common";
import { StorageModule } from "../storage/storage.module";
import { MietvertragDokumenteController, DokumenteController } from "./dokumente.controller";
import { DokumenteService } from "./dokumente.service";

@Module({
  imports: [StorageModule],
  controllers: [MietvertragDokumenteController, DokumenteController],
  providers: [DokumenteService],
})
export class DokumenteModule {}
