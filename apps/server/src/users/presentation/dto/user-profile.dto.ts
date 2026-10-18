import { nullableStringSchema } from '../../../shared/presentation/http/nullable-string.schema';
import type { UserProfile } from '../../application/models/user-profile';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class UserProfileDto extends createZodDto(
  z.object({
    id: z.string(),
    displayName: nullableStringSchema,
    isAnonymous: z.boolean(),
    email: nullableStringSchema,
  }) satisfies z.ZodType<UserProfile>,
) {}
