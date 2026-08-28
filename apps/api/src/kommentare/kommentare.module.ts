import { Module } from "@nestjs/common";
import { VorgangKommentareController, NebenkostenabrechnungKommentareController } from "./kommentare.controller";
import { KommentareService } from "./kommentare.service";

@Module({
  controllers: [VorgangKommentareController, NebenkostenabrechnungKommentareController],
  providers: [KommentareService],
})
export class KommentareModule {}
