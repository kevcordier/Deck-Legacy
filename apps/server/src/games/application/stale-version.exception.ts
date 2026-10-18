import { ConflictException } from '@nestjs/common';

/** `409 STALE_VERSION`: another device synced the game first. */
export function staleVersionException(): ConflictException {
  return new ConflictException({ code: 'STALE_VERSION', message: 'errors.staleVersion' });
}
