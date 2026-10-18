import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/** Body of every error response (`ApiExceptionFilter`). */
export class ApiErrorDto extends createZodDto(
  z.object({
    statusCode: z.number().int(),
    code: z.enum([
      'VALIDATION',
      'INVALID_GAME',
      'NOT_FOUND',
      'UNAUTHORIZED',
      'FORBIDDEN',
      'SERVER_ERROR',
      'KINGDOM_LIMIT',
      'STALE_VERSION',
    ]),
    message: z.string(),
  }),
) {}

export type ApiErrorBody = z.output<typeof ApiErrorDto.schema>;
export type ApiErrorCode = ApiErrorBody['code'];
