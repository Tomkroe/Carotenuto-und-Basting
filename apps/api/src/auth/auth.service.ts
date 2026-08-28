import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UserRole, AuthResponse } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtPayload } from "./jwt-payload.interface";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException("E-Mail-Adresse ist bereits registriert.");
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const mandant = await this.prisma.mandant.create({
      data: {
        name: dto.mandantName,
        users: {
          create: {
            email: dto.email,
            name: dto.name,
            passwordHash,
            role: UserRole.OWNER,
          },
        },
      },
      include: { users: true },
    });

    const user = mandant.users[0];
    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role as UserRole, mandantId: mandant.id },
      mandant: { id: mandant.id, name: mandant.name, createdAt: mandant.createdAt.toISOString() },
    };
  }

  async validateCredentials(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { mandant: true },
    });
    if (!user) throw new UnauthorizedException("E-Mail oder Passwort ist falsch.");

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) throw new UnauthorizedException("E-Mail oder Passwort ist falsch.");

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

  issueTokens(payload: JwtPayload) {
    const accessToken = this.jwt.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET ?? "dev-secret",
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
    });
    const refreshToken = this.jwt.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret",
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "30d",
    });
    return { accessToken, refreshToken };
  }
}
