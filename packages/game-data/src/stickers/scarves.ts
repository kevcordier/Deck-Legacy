import type { Sticker } from '@deck-legacy/engine/domain/types';

const scarf = (id: number, color: string): Sticker => ({
  id,
  label: `${color} Scarf`,
  tags: ['scarf'],
});

/** Romance: the scarves 59a–59f, one per lady; a knight wearing one is her knight. */
export const scarves: Sticker[] = [
  scarf(591, 'Red'),
  scarf(592, 'Yellow'),
  scarf(593, 'Pink'),
  scarf(594, 'Green'),
  scarf(595, 'Purple'),
  scarf(596, 'White'),
];
