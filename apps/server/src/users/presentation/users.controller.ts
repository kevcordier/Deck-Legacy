import type { AuthUser } from '../../auth/domain/auth-user';
import { CurrentUser } from '../../auth/presentation/current-user.decorator';
import { ApiErrorDto } from '../../shared/presentation/http/api-error.dto';
import { ZodValidationPipe } from '../../shared/presentation/http/zod-validation.pipe';
import { DeleteAccountUseCase } from '../application/delete-account.use-case';
import { GetProfileUseCase } from '../application/get-profile.use-case';
import type { UserProfile } from '../application/models/user-profile';
import { UpdateDisplayNameUseCase } from '../application/update-display-name.use-case';
import { UpdateProfileRequestDto } from './dto/update-profile-request.dto';
import { UserProfileDto } from './dto/user-profile.dto';
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
  constructor(
    private readonly getProfile: GetProfileUseCase,
    private readonly updateDisplayName: UpdateDisplayNameUseCase,
    private readonly deleteAccount: DeleteAccountUseCase,
  ) {}

  @Get()
  @ApiOkResponse({ type: UserProfileDto })
  getMe(@CurrentUser() user: AuthUser): Promise<UserProfile> {
    return this.getProfile.execute(user.id);
  }

  @Patch()
  @ApiOkResponse({ type: UserProfileDto })
  updateMe(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(UpdateProfileRequestDto.schema)) body: UpdateProfileRequestDto,
  ): Promise<UserProfile> {
    return this.updateDisplayName.execute(user.id, body.displayName);
  }

  /** Deletes the account and all its data (kingdoms, scores). */
  @Delete()
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMe(@CurrentUser() user: AuthUser): Promise<void> {
    return this.deleteAccount.execute(user.id);
  }
}
