import { Controller, Delete, HttpCode, HttpStatus, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { TodoLabelsService } from "./todo-labels.service";

@Controller("todos/:todoId/labels")
@UseGuards(JwtAuthGuard)
export class TodoLabelsController {
  constructor(private readonly todoLabelsService: TodoLabelsService) {}

  @Post(":labelId")
  @HttpCode(HttpStatus.NO_CONTENT)
  attach(
    @CurrentUser() user: JwtPayload,
    @Param("todoId") todoId: string,
    @Param("labelId") labelId: string,
  ): Promise<void> {
    return this.todoLabelsService.attach(user.mandantId, todoId, labelId);
  }

  @Delete(":labelId")
  @HttpCode(HttpStatus.NO_CONTENT)
  detach(
    @CurrentUser() user: JwtPayload,
    @Param("todoId") todoId: string,
    @Param("labelId") labelId: string,
  ): Promise<void> {
    return this.todoLabelsService.detach(user.mandantId, todoId, labelId);
  }
}
