import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  createParamDecorator,
} from "@nestjs/common";
import { fromNodeHeaders } from "better-auth/node";
import { auth, SessionUser } from "./auth";

const ADMIN_ROLES = new Set(["ADMIN", "EDITOR"]);

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session?.user) {
      throw new UnauthorizedException();
    }
    req.user = session.user;
    req.session = session.session;
    return true;
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session?.user) {
      throw new UnauthorizedException();
    }
    const role = (session.user as SessionUser).role;
    if (!role || !ADMIN_ROLES.has(role)) {
      throw new ForbiddenException();
    }
    req.user = session.user;
    req.session = session.session;
    return true;
  }
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SessionUser => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
