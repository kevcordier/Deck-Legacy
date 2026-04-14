import { PassiveType } from '@engine/domain/enums';
import type { Passive } from '@engine/domain/types';

export const CardPassives: Record<string, Passive> = {
  [PassiveType.STAY_IN_PLAY]: {
    id: 'stay_in_play',
    type: PassiveType.STAY_IN_PLAY,
  },
  [PassiveType.BLOCK]: {
    id: 'block',
    type: PassiveType.BLOCK,
  },
  [PassiveType.INCREASE_GLORY]: {
    id: 'increase_glory',
    type: PassiveType.INCREASE_GLORY,
  },
  [PassiveType.INCREASE_PRODUCTION]: {
    id: 'increase_production',
    type: PassiveType.INCREASE_PRODUCTION,
  },
};
