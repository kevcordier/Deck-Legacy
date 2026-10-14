import { robberCampStates } from './128';
import { CardTag, PassiveType, ResourceType } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

export const cliffyRobberCamp: CardDef = {
  id: 137,
  name: 'Large Robber Camp',
  states: robberCampStates(137, {
    name: 'Cliffy Forest',
    tags: [CardTag.LAND],
    productions: [{ [ResourceType.STONE]: 1, [ResourceType.WOOD]: 1 }],
    glory: { amount: 3 },
    passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
    illustration: `cards/137_4.jpg`,
  }),
};
