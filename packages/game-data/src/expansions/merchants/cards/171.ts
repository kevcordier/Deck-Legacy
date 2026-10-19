import { sheepStates } from './167';
import type { CardDef } from '@deck-legacy/engine/domain/types';

export const sheep22: CardDef = {
  id: 171,
  name: 'Pair of Sheep',
  // Pair of Sheep (Merchants 23)
  states: sheepStates(171, [190]),
};
