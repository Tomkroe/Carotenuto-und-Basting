import { Module } from "@nestjs/common";
import { AbrechnungPositionenController, PositionenController } from "./nebenkostenpositionen.controller";
import { NebenkostenpositionenService } from "./nebenkostenpositionen.service";

@Module({
  controllers: [AbrechnungPositionenController, PositionenController],
  providers: [NebenkostenpositionenService],
})
export class NebenkostenpositionenModule {}
