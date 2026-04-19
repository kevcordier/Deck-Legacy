import type { Sticker } from '@engine/domain/types';

export const remainsInPlay: Sticker = {
  id: 7,
  label: 'Remains in Play',
  type: 'add',
  description: 'Card remains in play at end of turn',
  effectId: 'stays_in_play',
};
