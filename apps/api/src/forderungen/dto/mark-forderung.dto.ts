import { IsIn, IsString } from "class-validator";
import { ForderungTyp } from "@maklerprogram/types";

export class MarkForderungDto {
  @IsString()
  mietvertragId!: string;

  @IsIn([ForderungTyp.MIETE, ForderungTyp.KAUTION])
  typ!: ForderungTyp;

  @IsString()
  periode!: string;

  @IsIn(["BEZAHLT", "VERLOREN", "OFFEN"])
  status!: "BEZAHLT" | "VERLOREN" | "OFFEN";
}
