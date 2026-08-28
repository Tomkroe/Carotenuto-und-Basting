import { Controller, Get, NotFoundException, UseGuards } from "@nestjs/common";
import { MeResponse, UserListItem, UserRole } from "@maklerprogram/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";
import { PrismaService } from "../prisma/prisma.service";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(@CurrentUser() currentUser: JwtPayload): Promise<UserListItem[]> {
    const users = await this.prisma.user.findMany({
      where: { mandantId: currentUser.mandantId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return users;
  }

  @Get("me")
  async me(@CurrentUser() currentUser: JwtPayload): Promise<MeResponse> {
    // Mandanten-Scoping: user wird über die eigene id UND mandantId aus dem Token geladen.
    const user = await this.prisma.user.findFirst({
      where: { id: currentUser.sub, mandantId: currentUser.mandantId },
      include: { mandant: true },
    });
    if (!user) throw new NotFoundException("Nutzer nicht gefunden.");

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        mandantId: user.mandantId,
      },
      mandant: {
        id: user.mandant.id,
        name: user.mandant.name,
        createdAt: user.mandant.createdAt.toISOString(),
      },
    };
  }
}
