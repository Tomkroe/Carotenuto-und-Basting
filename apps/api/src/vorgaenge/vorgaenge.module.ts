import { Module } from "@nestjs/common";
import { VorgaengeController } from "./vorgaenge.controller";
import { VorgaengeService } from "./vorgaenge.service";

@Module({
  controllers: [VorgaengeController],
  providers: [VorgaengeService],
})
export class VorgaengeModule {}
