import { Module } from "@nestjs/common";
import { LabelsController } from "./labels.controller";
import { LabelsService } from "./labels.service";
import { VorgangLabelsController } from "./vorgang-labels.controller";
import { VorgangLabelsService } from "./vorgang-labels.service";

@Module({
  controllers: [LabelsController, VorgangLabelsController],
  providers: [LabelsService, VorgangLabelsService],
})
export class LabelsModule {}
