import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { MeController } from "./me.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [AuthController, MeController],
})
export class AuthModule {}
