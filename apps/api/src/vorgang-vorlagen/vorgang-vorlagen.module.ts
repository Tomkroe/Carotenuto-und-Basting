import { Module } from "@nestjs/common";
import { VorgangVorlagenController } from "./vorgang-vorlagen.controller";
import { VorgangVorlagenService } from "./vorgang-vorlagen.service";

@Module({
  controllers: [VorgangVorlagenController],
  providers: [VorgangVorlagenService],
})
export class VorgangVorlagenModule {}
