import { Module } from "@nestjs/common";
import { DokumentKategorienController } from "./dokument-kategorien.controller";
import { DokumentKategorienService } from "./dokument-kategorien.service";

@Module({
  controllers: [DokumentKategorienController],
  providers: [DokumentKategorienService],
})
export class DokumentKategorienModule {}
