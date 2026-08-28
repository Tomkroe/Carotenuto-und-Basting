import { Module } from "@nestjs/common";
import { KontakteController } from "./kontakte.controller";
import { KontakteService } from "./kontakte.service";

@Module({
  controllers: [KontakteController],
  providers: [KontakteService],
  exports: [KontakteService],
})
export class KontakteModule {}
