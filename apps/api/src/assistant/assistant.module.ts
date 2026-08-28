import { Module } from "@nestjs/common";
import { VorgaengeModule } from "../vorgaenge/vorgaenge.module";
import { ObjekteModule } from "../objekte/objekte.module";
import { EinheitenModule } from "../einheiten/einheiten.module";
import { KontakteModule } from "../kontakte/kontakte.module";
import { KommentareModule } from "../kommentare/kommentare.module";
import { MietvertraegeModule } from "../mietvertraege/mietvertraege.module";
import { DokumenteModule } from "../dokumente/dokumente.module";
import { AssistantController } from "./assistant.controller";
import { AssistantService } from "./assistant.service";

@Module({
  imports: [
    VorgaengeModule,
    ObjekteModule,
    EinheitenModule,
    KontakteModule,
    KommentareModule,
    MietvertraegeModule,
    DokumenteModule,
  ],
  controllers: [AssistantController],
  providers: [AssistantService],
})
export class AssistantModule {}
