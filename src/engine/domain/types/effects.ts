import { PassiveType, TargetScope } from '@engine/domain/enums';
import type { Passive } from '@engine/domain/types';

export const CardPassives: Record<string, Passive> = {
  [PassiveType.STAY_IN_PLAY]: {
    id: 'stay_in_play',
    type: PassiveType.STAY_IN_PLAY,
    cards: {
      scope: [TargetScope.SELF],
    },
  },
  [PassiveType.BLOCK]: {
    id: 'block',
    type: PassiveType.BLOCK,
  },
  [PassiveType.INCREASE_PRODUCTION]: {
    id: 'increase_production',
    type: PassiveType.INCREASE_PRODUCTION,
  },
  [PassiveType.CANT_ADVANCE]: {
    id: 'cant_advance',
    type: PassiveType.CANT_ADVANCE,
  },
};
