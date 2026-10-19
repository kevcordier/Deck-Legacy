import { chickenStates } from './160';
import type { CardDef } from '@deck-legacy/engine/domain/types';

export const chicken21: CardDef = {
  id: 170,
  name: 'Chicken',
  // Chicken (Merchants 20)
  states: chickenStates(170, [187]),
};
