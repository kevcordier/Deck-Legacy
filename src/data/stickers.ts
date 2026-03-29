import type { Sticker } from '@engine/domain/types';

export const stickerData: Sticker[] = [
  {
    id: 1,
    label: 'Gold',
    type: 'add',
    description: '+1 gold to each production',
    production: 'gold',
  },
  {
    id: 2,
    label: 'Wood',
    type: 'add',
    description: '+1 wood to each production',
    production: 'wood',
  },
  {
    id: 3,
    label: 'Stone',
    type: 'add',
    description: '+1 stone to each production',
    production: 'stone',
  },
  {
    id: 4,
    label: 'Iron',
    type: 'add',
    description: '+1 iron to each production',
    production: 'iron',
  },
  {
    id: 5,
    label: 'Sword',
    type: 'add',
    description: '+1 sword to each production',
    production: 'sword',
  },
  {
    id: 6,
    label: 'Goods',
    type: 'add',
    description: '+1 goods to each production',
    production: 'goods',
  },
  {
    id: 7,
    label: 'Remains in Play',
    type: 'add',
    description: 'Card remains in play at end of turn',
    effectId: 'stays_in_play',
  },
  {
    id: 8,
    label: '+2 Glory',
    type: 'add',
    description: '+2 Glory points',
    glory: 2,
  },
  {
    id: 10,
    label: '+5 Glory',
    type: 'add',
    description: '+5 Glory points',
    glory: 5,
  },
  {
    id: 11,
    label: 'Knight',
    type: 'add',
    description: 'Adds knight tag to card',
    tags: ['knight'],
  },
];

export const globalStock = {
  '1': 10,
  '2': 10,
  '3': 5,
  '4': 5,
  '5': 5,
  '6': 5,
  '7': 2,
  '8': 5,
  '10': 5,
  '11': 1,
};
