import { Module } from "@nestjs/common";
import { VorgangTodosController, TodosController } from "./todos.controller";
import { TodosService } from "./todos.service";
import { VerlaufModule } from "../vorgaenge/verlauf.module";

@Module({
  imports: [VerlaufModule],
  controllers: [VorgangTodosController, TodosController],
  providers: [TodosService],
})
export class TodosModule {}
