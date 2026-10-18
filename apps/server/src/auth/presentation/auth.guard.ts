import { EnsureUserUseCase } from '../../users/application/ensure-user.use-case';
import { InvalidTokenError } from '../application/invalid-token.error';
import { TokenVerifier } from '../application/token-verifier';
import type { AuthenticatedRequest } from './current-user.decorator';
import { IS_PUBLIC } from './public.decorator';
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
    private readonly verifier: TokenVerifier,
    private readonly ensureUser: EnsureUserUseCase,
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
      await this.ensureUser.execute(user);
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
