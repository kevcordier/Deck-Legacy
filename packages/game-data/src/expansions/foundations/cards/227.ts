import { scholar } from './scholar';
import { ResourceType } from '@deck-legacy/engine/domain/enums';

const { GOLD, SCIENCE } = ResourceType;

/** Student (Foundations 54–57). */
export const student = scholar({
  id: 227,
  names: ['Student', 'Adept Student', 'Scholar', 'Scientist'],
  costs: [{ [GOLD]: 3 }, { [GOLD]: 5 }, { [SCIENCE]: 2 }],
  productions: [{ [GOLD]: 1 }, { [SCIENCE]: 1 }, { [SCIENCE]: 2 }],
  glory: 3,
  breakthrough: 6,
});
