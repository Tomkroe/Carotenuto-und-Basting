import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ToDo } from "@maklerprogram/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { TodosService } from "./todos.service";
import { CreateToDoDto } from "./dto/create-todo.dto";
import { UpdateToDoDto } from "./dto/update-todo.dto";

@Controller("vorgaenge/:vorgangId/todos")
@UseGuards(JwtAuthGuard)
export class VorgangTodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Param("vorgangId") vorgangId: string): Promise<ToDo[]> {
    return this.todosService.findAllForVorgang(user.mandantId, vorgangId);
  }

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Param("vorgangId") vorgangId: string,
    @Body() dto: CreateToDoDto,
  ): Promise<ToDo> {
    return this.todosService.create(user.mandantId, vorgangId, dto);
  }
}

@Controller("todos")
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Patch(":id")
  update(@CurrentUser() user: JwtPayload, @Param("id") id: string, @Body() dto: UpdateToDoDto): Promise<ToDo> {
    return this.todosService.update(user.mandantId, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<void> {
    return this.todosService.remove(user.mandantId, id);
  }
}
