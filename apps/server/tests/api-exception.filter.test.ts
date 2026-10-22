import { ApiExceptionFilter } from '../src/shared/presentation/http/api-exception.filter';
import { errorMessage } from '../src/shared/presentation/http/error-message';
import { type ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

describe('errorMessage', () => {
  it('reads the message of the exception response', () => {
    expect(errorMessage('Not found', 'fallback')).toBe('Not found');
    expect(errorMessage({ message: 'Forbidden' }, 'fallback')).toBe('Forbidden');
    expect(errorMessage({ message: ['a', 'b'] }, 'fallback')).toBe('a,b');
  });

  it('falls back to the exception message', () => {
    expect(errorMessage({}, 'fallback')).toBe('fallback');
    expect(errorMessage({ message: { nested: true } }, 'fallback')).toBe('fallback');
  });
});

describe('ApiExceptionFilter', () => {
  function respond(exception: unknown) {
    const response = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const host = {
      switchToHttp: () => ({ getResponse: () => response }),
    } as unknown as ArgumentsHost;
    new ApiExceptionFilter().catch(exception, host);
    return response.json.mock.calls[0][0];
  }

  it('maps an exception with a plain message to its status code', () => {
    expect(respond(new HttpException('Gone', HttpStatus.NOT_FOUND))).toEqual({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'Gone',
    });
  });

  it('hides anything thrown that is not an error', () => {
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    expect(respond('oops')).toEqual({
      statusCode: 500,
      code: 'SERVER_ERROR',
      message: 'errors.unknown',
    });
  });
});
