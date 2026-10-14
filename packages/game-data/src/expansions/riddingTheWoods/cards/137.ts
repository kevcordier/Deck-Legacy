import { robberCampStates } from './129';
import { CardTag, ResourceType } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

export const denseRobberCamp: CardDef = {
  id: 137,
  name: 'Large Robber Camp',
  states: robberCampStates(137, {
    name: 'Dense Forest',
    tags: [CardTag.LAND],
    productions: [{ [ResourceType.WOOD]: 3 }],
    glory: { amount: 3 },
  }),
};
