import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

/**
 * Mandanten-Scoping-Konvention: Prisma unterstützt kein natives Row-Level-Scoping,
 * daher gilt für JEDES neue Modul: die mandantId kommt aus dem authentifizierten
 * User (req.user.mandantId, siehe CurrentUser-Decorator) und wird explizit in
 * jede where-Klausel aufgenommen (z.B. `where: { id, mandantId }`). Nie eine Query
 * ohne mandantId-Filter auf mandanten-gebundenen Modellen ausführen.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
