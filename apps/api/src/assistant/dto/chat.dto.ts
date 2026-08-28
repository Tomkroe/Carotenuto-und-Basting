import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsIn, IsString, MinLength, ValidateNested } from "class-validator";

export class ChatMessageDto {
  @IsIn(["user", "model"])
  role!: "user" | "model";

  @IsString()
  @MinLength(1)
  text!: string;
}

export class ChatDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages!: ChatMessageDto[];
}
