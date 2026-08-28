import { UserRole } from "@maklerprogram/types";

export interface JwtPayload {
  sub: string; // userId
  mandantId: string;
  role: UserRole;
}
