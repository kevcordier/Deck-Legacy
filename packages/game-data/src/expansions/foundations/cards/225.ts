import { scholar } from './scholar';
import { ResourceType } from '@deck-legacy/engine/domain/enums';

const { GOLD, SCIENCE } = ResourceType;

/** Curious Boy (Foundations 52). */
export const curiousBoy = scholar({
  id: 225,
  names: ['Curious Boy', 'Eager Student', 'Prodigy', '_____'],
  costs: [{ [GOLD]: 4 }, { [GOLD]: 4 }, { [SCIENCE]: 3 }],
  productions: [null, { [SCIENCE]: 1 }, { [SCIENCE]: 3 }],
  glory: 3,
  breakthrough: 10,
  chooseName: true,
});
