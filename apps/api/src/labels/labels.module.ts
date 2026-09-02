import { Module } from "@nestjs/common";
import { LabelsController } from "./labels.controller";
import { LabelsService } from "./labels.service";
import { VorgangLabelsController } from "./vorgang-labels.controller";
import { VorgangLabelsService } from "./vorgang-labels.service";
import { TodoLabelsController } from "./todo-labels.controller";
import { TodoLabelsService } from "./todo-labels.service";
import { VerlaufModule } from "../vorgaenge/verlauf.module";

@Module({
  imports: [VerlaufModule],
  controllers: [LabelsController, VorgangLabelsController, TodoLabelsController],
  providers: [LabelsService, VorgangLabelsService, TodoLabelsService],
})
export class LabelsModule {}
