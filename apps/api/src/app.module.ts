import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ObjekteModule } from "./objekte/objekte.module";
import { EinheitenModule } from "./einheiten/einheiten.module";
import { KontakteModule } from "./kontakte/kontakte.module";
import { VorgaengeModule } from "./vorgaenge/vorgaenge.module";
import { TodosModule } from "./todos/todos.module";
import { KommentareModule } from "./kommentare/kommentare.module";
import { StorageModule } from "./storage/storage.module";
import { MietvertraegeModule } from "./mietvertraege/mietvertraege.module";
import { DokumenteModule } from "./dokumente/dokumente.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ObjekteModule,
    EinheitenModule,
    KontakteModule,
    VorgaengeModule,
    TodosModule,
    KommentareModule,
    StorageModule,
    MietvertraegeModule,
    DokumenteModule,
  ],
})
export class AppModule {}
