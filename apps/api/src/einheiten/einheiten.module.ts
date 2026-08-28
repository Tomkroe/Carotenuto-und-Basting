import { Module } from "@nestjs/common";
import { ObjektEinheitenController, EinheitenController } from "./einheiten.controller";
import { EinheitenService } from "./einheiten.service";

@Module({
  controllers: [ObjektEinheitenController, EinheitenController],
  providers: [EinheitenService],
  exports: [EinheitenService],
})
export class EinheitenModule {}
