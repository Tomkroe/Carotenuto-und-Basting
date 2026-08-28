import { Module } from "@nestjs/common";
import { EigentuemerschaftenController } from "./eigentuemerschaften.controller";
import { EigentuemerschaftenService } from "./eigentuemerschaften.service";

@Module({
  controllers: [EigentuemerschaftenController],
  providers: [EigentuemerschaftenService],
})
export class EigentuemerschaftenModule {}
