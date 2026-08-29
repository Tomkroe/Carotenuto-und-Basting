import { Module } from "@nestjs/common";
import { LabelsController } from "./labels.controller";
import { LabelsService } from "./labels.service";
import { VorgangLabelsController } from "./vorgang-labels.controller";
import { VorgangLabelsService } from "./vorgang-labels.service";
import { VerlaufModule } from "../vorgaenge/verlauf.module";

@Module({
  imports: [VerlaufModule],
  controllers: [LabelsController, VorgangLabelsController],
  providers: [LabelsService, VorgangLabelsService],
})
export class LabelsModule {}
