import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsIn, IsOptional, IsString, MinLength, ValidateNested } from "class-validator";

export class ChatMessageDto {
  @IsIn(["user", "model"])
  role!: "user" | "model";

  @IsString()
  @MinLength(1)
  text!: string;
}

export class ChatAttachmentDto {
  @IsString()
  @MinLength(1)
  filename!: string;

  @IsString()
  @MinLength(1)
  mimeType!: string;

  @IsString()
  @MinLength(1)
  dataBase64!: string;
}

export class ChatDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages!: ChatMessageDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ChatAttachmentDto)
  attachment?: ChatAttachmentDto;
}
