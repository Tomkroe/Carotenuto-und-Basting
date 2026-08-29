import { Module } from "@nestjs/common";
import { VerlaufService } from "./verlauf.service";

@Module({
  providers: [VerlaufService],
  exports: [VerlaufService],
})
export class VerlaufModule {}
