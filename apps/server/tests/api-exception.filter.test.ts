import { errorMessage } from '../src/shared/presentation/http/error-message';
import { describe, expect, it } from 'vitest';

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
