import { Module } from "@nestjs/common";
import { ZaehlerController } from "./zaehler.controller";
import { ZaehlerService } from "./zaehler.service";

@Module({
  controllers: [ZaehlerController],
  providers: [ZaehlerService],
})
export class ZaehlerModule {}
