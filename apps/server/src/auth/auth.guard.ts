import { UsersService } from '../users/application/users.service';
import type { AuthenticatedRequest } from './current-user.decorator';
import { InvalidTokenError } from './invalid-token.error';
import { IS_PUBLIC } from './public.decorator';
import { SupabaseTokenVerifier } from './supabase-token.verifier';
import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/** Global guard: every route requires a Supabase access token unless marked `@Public()`. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly verifier: SupabaseTokenVerifier,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization ?? '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Missing access token');
    }

    try {
      const user = await this.verifier.verify(token);
      await this.users.ensureUser(user);
      request.user = user;
      return true;
    } catch (error) {
      if (error instanceof InvalidTokenError) {
        throw new UnauthorizedException('Invalid access token');
      }
      throw error;
    }
  }
}
