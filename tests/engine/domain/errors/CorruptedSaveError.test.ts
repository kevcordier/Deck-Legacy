import { CorruptedSaveError } from '@engine/domain/errors/CorruptedSaveError';
import { describe, expect, it } from 'vitest';

describe('CorruptedSaveError', () => {
  it('builds a typed error with default message and prototype', () => {
    const error = new CorruptedSaveError();

    expect(error.message).toBe('errors.boundary.corruptedSave');
    expect(error.name).toBe('CorruptedSaveError');
    expect(error).toBeInstanceOf(CorruptedSaveError);
  });

  it('sets cause when a message is provided', () => {
    const error = new CorruptedSaveError('invalid checksum') as CorruptedSaveError & {
      cause?: string;
    };

    expect(error.cause).toBe('invalid checksum');
  });
});
