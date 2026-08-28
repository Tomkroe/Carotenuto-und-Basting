import { Module } from "@nestjs/common";
import {
  VorgangKommentareController,
  NebenkostenabrechnungKommentareController,
  KontaktKommentareController,
} from "./kommentare.controller";
import { KommentareService } from "./kommentare.service";

@Module({
  controllers: [VorgangKommentareController, NebenkostenabrechnungKommentareController, KontaktKommentareController],
  providers: [KommentareService],
})
export class KommentareModule {}
