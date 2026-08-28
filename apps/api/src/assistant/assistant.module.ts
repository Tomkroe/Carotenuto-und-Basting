import { Module } from "@nestjs/common";
import { VorgaengeModule } from "../vorgaenge/vorgaenge.module";
import { ObjekteModule } from "../objekte/objekte.module";
import { KontakteModule } from "../kontakte/kontakte.module";
import { KommentareModule } from "../kommentare/kommentare.module";
import { AssistantController } from "./assistant.controller";
import { AssistantService } from "./assistant.service";

@Module({
  imports: [VorgaengeModule, ObjekteModule, KontakteModule, KommentareModule],
  controllers: [AssistantController],
  providers: [AssistantService],
})
export class AssistantModule {}
