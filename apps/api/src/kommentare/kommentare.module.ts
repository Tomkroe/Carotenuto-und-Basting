import { Module } from "@nestjs/common";
import { KommentareController } from "./kommentare.controller";
import { KommentareService } from "./kommentare.service";

@Module({
  controllers: [KommentareController],
  providers: [KommentareService],
})
export class KommentareModule {}
