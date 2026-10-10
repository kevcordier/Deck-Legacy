import type { ApiErrorBody, ApiErrorCode } from '@deck-legacy/api-contract';
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

const EXPLICIT_CODES = new Set<ApiErrorCode>(['KINGDOM_LIMIT']);

/** Code given by the thrown exception (`new ConflictException({ code, message })`). */
function explicitCode(raw: string | object): ApiErrorCode | undefined {
  if (typeof raw === 'string') return undefined;
  const code = (raw as { code?: unknown }).code;
  return EXPLICIT_CODES.has(code as ApiErrorCode) ? (code as ApiErrorCode) : undefined;
}

const CODES: Partial<Record<number, ApiErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: 'VALIDATION',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'INVALID_GAME',
};

/** Serialises every error as an `ApiErrorBody` so the client handles one shape. */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const raw = exception.getResponse();
      const message =
        typeof raw === 'string'
          ? raw
          : String((raw as { message?: unknown }).message ?? exception.message);
      const body: ApiErrorBody = {
        statusCode,
        code: explicitCode(raw) ?? CODES[statusCode] ?? 'SERVER_ERROR',
        message,
      };
      response.status(statusCode).json(body);
      return;
    }

    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    const body: ApiErrorBody = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'SERVER_ERROR',
      message: 'errors.unknown',
    };
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(body);
  }
}
