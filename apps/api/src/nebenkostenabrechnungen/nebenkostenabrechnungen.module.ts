import { Module } from "@nestjs/common";
import { NebenkostenabrechnungenController } from "./nebenkostenabrechnungen.controller";
import { NebenkostenabrechnungenService } from "./nebenkostenabrechnungen.service";

@Module({
  controllers: [NebenkostenabrechnungenController],
  providers: [NebenkostenabrechnungenService],
})
export class NebenkostenabrechnungenModule {}
