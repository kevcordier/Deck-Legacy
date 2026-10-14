import { robberCampStates } from './129';
import { CardTag, PassiveType, ResourceType } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

export const cliffyRobberCamp: CardDef = {
  id: 138,
  name: 'Large Robber Camp',
  states: robberCampStates(138, {
    name: 'Cliffy Forest',
    tags: [CardTag.LAND],
    productions: [{ [ResourceType.STONE]: 1, [ResourceType.WOOD]: 1 }],
    glory: { amount: 3 },
    passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
  }),
};
