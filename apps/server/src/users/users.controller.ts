import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { UsersService } from './users.service';
import {
  type UpdateProfileRequest,
  type UserProfile,
  updateProfileRequestSchema,
} from '@deck-legacy/api-contract';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common';

@Controller('me')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  getMe(@CurrentUser() user: AuthUser): Promise<UserProfile> {
    return this.users.getProfile(user.id);
  }

  @Patch()
  updateMe(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(updateProfileRequestSchema)) body: UpdateProfileRequest,
  ): Promise<UserProfile> {
    return this.users.updateDisplayName(user.id, body.displayName);
  }

  /** Deletes the account and all its data (kingdoms, scores). */
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMe(@CurrentUser() user: AuthUser): Promise<void> {
    return this.users.deleteAccount(user.id);
  }
}
