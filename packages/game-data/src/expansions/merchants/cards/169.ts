import { chickenStates } from './160';
import type { CardDef } from '@deck-legacy/engine/domain/types';

export const chicken20: CardDef = {
  id: 169,
  name: 'Chicken',
  // Chicken (Merchants 21)
  states: chickenStates(169, [188]),
};
