import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class UpdateProfileRequestDto extends createZodDto(
  z.object({
    displayName: z.string().trim().min(2).max(32),
  }),
) {}
