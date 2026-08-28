import { Module } from "@nestjs/common";
import { MietvertraegeController } from "./mietvertraege.controller";
import { MietvertraegeService } from "./mietvertraege.service";

@Module({
  controllers: [MietvertraegeController],
  providers: [MietvertraegeService],
  exports: [MietvertraegeService],
})
export class MietvertraegeModule {}
