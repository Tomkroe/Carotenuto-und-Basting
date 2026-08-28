import { Module } from "@nestjs/common";
import { ZaehlerZaehlerstaendeController, ZaehlerstaendeController } from "./zaehlerstaende.controller";
import { ZaehlerstaendeService } from "./zaehlerstaende.service";

@Module({
  controllers: [ZaehlerZaehlerstaendeController, ZaehlerstaendeController],
  providers: [ZaehlerstaendeService],
})
export class ZaehlerstaendeModule {}
