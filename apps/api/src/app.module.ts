import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ObjekteModule } from "./objekte/objekte.module";
import { EinheitenModule } from "./einheiten/einheiten.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ObjekteModule,
    EinheitenModule,
  ],
})
export class AppModule {}
