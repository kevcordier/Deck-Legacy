import type { AuthUser } from '../../auth/auth-user';
import { CurrentUser } from '../../auth/current-user.decorator';
import { ApiErrorDto } from '../../shared/http/api-error.dto';
import { ZodValidationPipe } from '../../shared/http/zod-validation.pipe';
import { UpdateProfileRequestDto } from '../application/dto/update-profile-request.dto';
import { type UserProfile, UserProfileDto } from '../application/dto/user-profile.dto';
import { UsersService } from '../application/users.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiDefaultResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('me')
@ApiBearerAuth()
@ApiDefaultResponse({ type: ApiErrorDto })
@Controller('me')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @ApiOkResponse({ type: UserProfileDto })
  getMe(@CurrentUser() user: AuthUser): Promise<UserProfile> {
    return this.users.getProfile(user.id);
  }

  @Patch()
  @ApiOkResponse({ type: UserProfileDto })
  updateMe(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(UpdateProfileRequestDto.schema)) body: UpdateProfileRequestDto,
  ): Promise<UserProfile> {
    return this.users.updateDisplayName(user.id, body.displayName);
  }

  /** Deletes the account and all its data (kingdoms, scores). */
  @Delete()
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMe(@CurrentUser() user: AuthUser): Promise<void> {
    return this.users.deleteAccount(user.id);
  }
}
