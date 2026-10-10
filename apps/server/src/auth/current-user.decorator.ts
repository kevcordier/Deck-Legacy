import type { AuthUser } from './auth-user';
import { type ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { Request } from 'express';

export type AuthenticatedRequest = Request & { user?: AuthUser };

/** Injects the authenticated user set by `AuthGuard`. */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  return request.user;
});
