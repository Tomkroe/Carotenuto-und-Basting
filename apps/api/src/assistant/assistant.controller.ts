import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AssistantChatResponse } from "@maklerprogram/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { AssistantService } from "./assistant.service";
import { ChatDto } from "./dto/chat.dto";

@Controller("assistant")
@UseGuards(JwtAuthGuard)
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post("chat")
  chat(@CurrentUser() user: JwtPayload, @Body() dto: ChatDto): Promise<AssistantChatResponse> {
    return this.assistantService.chat(user.mandantId, user.sub, dto.messages);
  }
}
