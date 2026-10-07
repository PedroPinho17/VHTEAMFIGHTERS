import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { IsString, MinLength } from "class-validator";
import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";
import { auth } from "./auth";
import { AuthGuard, CurrentUser, type SessionUser } from "./auth.guard";
import { PrismaService } from "../prisma/prisma.service";

class ChangePasswordDto {
  @IsString()
  @MinLength(12)
  currentPassword!: string;

  @IsString()
  @MinLength(12)
  newPassword!: string;
}

@Controller("api/admin/me")
export class MeController {
  constructor(private readonly prisma: PrismaService) {}

  /** Change password even when mustChangePassword blocks AdminGuard. */
  @Post("change-password")
  @UseGuards(AuthGuard)
  async changePassword(
    @CurrentUser() user: SessionUser,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    await auth.api.changePassword({
      body: {
        currentPassword: dto.currentPassword,
        newPassword: dto.newPassword,
        revokeOtherSessions: true,
      },
      headers: fromNodeHeaders(req.headers),
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { mustChangePassword: false },
    });

    return { ok: true };
  }
}
