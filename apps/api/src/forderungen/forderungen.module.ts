import { Module } from "@nestjs/common";
import { ForderungenController } from "./forderungen.controller";
import { ForderungenService } from "./forderungen.service";

@Module({
  controllers: [ForderungenController],
  providers: [ForderungenService],
})
export class ForderungenModule {}
