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
};
