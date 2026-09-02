import { Module } from "@nestjs/common";
import { ObjekteController } from "./objekte.controller";
import { ObjekteService } from "./objekte.service";
import { StorageModule } from "../storage/storage.module";

@Module({
  imports: [StorageModule],
  controllers: [ObjekteController],
  providers: [ObjekteService],
  exports: [ObjekteService],
})
export class ObjekteModule {}
