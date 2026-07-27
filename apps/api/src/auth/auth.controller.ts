import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard, CurrentUser } from "./auth.guard";
import { SessionUser } from "./auth";

@Controller("api/me")
export class AuthController {
  @Get()
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: SessionUser) {
    return { user };
  }
}
