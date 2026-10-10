import { PassiveType, TargetScope } from '../enums';
import type { Passive } from './';

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
  [PassiveType.ADJUST_PRODUCTION]: {
    id: 'ADJUST_production',
    type: PassiveType.ADJUST_PRODUCTION,
  },
  [PassiveType.DESACTIVATE_OPTION]: {
    id: 'desactivate_option',
    type: PassiveType.DESACTIVATE_OPTION,
    options: [],
  },
};
