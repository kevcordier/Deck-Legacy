import { nullableStringSchema } from '../../../shared/http/nullable-string.schema';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class UserProfileDto extends createZodDto(
  z.object({
    id: z.string(),
    displayName: nullableStringSchema,
    isAnonymous: z.boolean(),
    email: nullableStringSchema,
  }),
) {}

export type UserProfile = z.output<typeof UserProfileDto.schema>;
