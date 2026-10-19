import { sheepStates } from './167';
import type { CardDef } from '@deck-legacy/engine/domain/types';

export const sheep23: CardDef = {
  id: 172,
  name: 'Pair of Sheep',
  // Pair of Sheep (Merchants 22)
  states: sheepStates(172, [189]),
};
