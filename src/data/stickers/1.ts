import type { Sticker } from '@engine/domain/types';

export const gold: Sticker = {
  id: 1,
  label: 'Gold',
  type: 'add',
  description: '+1 gold to each production',
  production: 'gold',
};
