import { Module } from "@nestjs/common";
import { VorgangTodosController, TodosController } from "./todos.controller";
import { TodosService } from "./todos.service";

@Module({
  controllers: [VorgangTodosController, TodosController],
  providers: [TodosService],
})
export class TodosModule {}
